from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import CrossEncoder
import google.generativeai as genai
import os
import dotenv

dotenv.load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app)

# Load the pre-trained cross-encoder model and generative model
model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
llm_model = genai.GenerativeModel('gemini-1.5-flash', generation_config={'temperature': 0.0})

NEGATIVE_PROMPT = "DO NOT include the email subject in the response. DO NOT include the incomple email in the response. Only include the parts that need to be completed."
template = """You're writing expert. Given some examples of the user's writing, your task is mimic the writing style of the user and help the user complete their email. 

Complete the email the following email subject using the same writing style as the examples above. {NEGATIVE_PROMPT}

###Example Format
WRITING_EXAMPLES: 
I've spent me fair share o' years sailin' the seven seas, plunderin' treasure and battlin' scurvy dogs. 
Me trusty cutlass be me best mate, and I've used it to defend me ship and me crew from the scallywags that dare cross me path. 
I've got a map that'll lead ye to the hidden treasure o' the infamous Captain Blackbeard, but ye'll have to navigate through treacherous waters and avoid the authorities to get yer hands on it. 
Me parrot, Polly, be a feisty bird with a penchant for squawkin' "Shiver me timbers!" whenever we spot a ship flyin' the Jolly Roger. 
So hoist the colors, me hearties, and set sail with me on a quest for adventure and riches!Arr may

SUBJECT: 
Job Interview Follow-up

INCOMPLETE_EMAIL: 
Dear [Hiring Manager's Name],

Arrr,

I be writin' to follow up on me interview for the [Position] role at [Company Name] on [Date of Interview].

EMAIL_COMPLETION: 
 I be wantin' to make sure ye didn't forget about me, the scurvy dog with the impressive resume and the charm o' a sea siren.

I be still very interested in joinin' yer crew and contributin' me skills to help ye find yer treasure (or in this case, success in the [industry/field]). I be thinkin' I'd make a great fit, and I be willin' to walk the plank to prove it!

If ye need any more information from me, or if ye want to schedule another meetin' to discuss me qualifications, just let me know. I be ready to set sail at a moment's notice.

Fair winds, and I look forward to hearin' from ye soon.

Yer mate,

[Your Name]

###Query
WRITING_EXAMPLES: 
{docs}

SUBJECT: 
{query}

INCOMPLETE_EMAIL:
{incomplete_email}

EMAIL_COMPLETION: """

def rank_documents(model, query, documents):
    # Create pairs of (query, document) for prediction
    pairs = [(query, doc) for doc in documents]

    # Compute similarity scores
    scores = model.predict(pairs).astype(float)

    # Sort documents based on similarity scores
    return sorted(zip(scores, documents), reverse=True)

@app.route('/')
def home():
    return "Welcome to the Document Ranking API!"

@app.route('/get_mail', methods=['POST'])
def rank():
    data = request.json
    query = data.get('subject')
    documents = data.get('documents')
    incomplete_email = data.get('incomplete_email')
    
    if not query or not documents:
        return jsonify({"error": "Query and documents are required"}), 400
    
    ranked_documents = rank_documents(model, query, documents)
    # print(ranked_documents)
    
    # Convert float32 to float
    ranked_documents = [{"score": score, "document": doc} for score, doc in ranked_documents if score > 10.0]
    # return jsonify(ranked_documents)
    print(f"Ranked documents: {ranked_documents}")
    
    if ranked_documents:
        docs = [doc["document"] for doc in ranked_documents[:5]]
        prompt = template.format(query=query, docs="\n".join(docs), incomplete_email=incomplete_email, NEGATIVE_PROMPT=NEGATIVE_PROMPT)
        print(f"Prompt (with examples): \n{prompt}")
        response = llm_model.generate_content(prompt).text
    else:
        # If no documents are relevant, use the LLM model to generate a response
        prompt = f"Complete the incomplete email for the following email subject. {NEGATIVE_PROMPT}\n ###Query\nSUBJECT: {query}\nINCOMPLETE_EMAIL: {incomplete_email}\nEMAIL_COMPLETION: "
        print(f"Prompt (without examples): \n{prompt}")
        response = llm_model.generate_content(prompt).text

    return jsonify({"response": response})


if __name__ == '__main__':
    app.run(debug=True)
