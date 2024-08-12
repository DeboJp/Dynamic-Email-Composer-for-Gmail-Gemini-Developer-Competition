// background.js
let latestSubjectLine = "";
let latestBodyContent = "";

// Listen for updates from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateEmailContent") {
        latestSubjectLine = request.subject;
        latestBodyContent = request.body;

        console.log("Latest Subject Line:", latestSubjectLine);
        console.log("Latest Body Content:", latestBodyContent);

        sendResponse({status: "Content updated in background script"});
    }
});

// Example function to access the latest subject line and body
function logLatestEmailContent() {
    console.log("Accessing latest content from background:");
    console.log("Subject:", latestSubjectLine);
    console.log("Body:", latestBodyContent);
}

// You can call logLatestEmailContent whenever you need to access the latest email content in the background script


let emailDocuments = [];

function sendPostRequestToFlask() {
    const url = 'http://127.0.0.1:5000/get_mail'; // Flask server endpoint

    const data = {
        subject: latestSubjectLine,
        documents: emailDocuments,
        incomplete_email: latestBodyContent
    }
    console.log('emailDocuments:', emailDocuments);
    console.log('data:', data);


    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responseJson => {
        console.log('Response from Flask server:', JSON.stringify(responseJson, null, 2));

        // Wait for the content script to be ready before sending the message
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "logResponse", data: JSON.stringify(responseJson, null, 2)}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError.message);
                }
            });
        });        
    })
    .catch(error => {
        console.error('Error with POST request:', error);
    });
}

// Wait until the tab is updated and fully loaded before calling the function
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     if (changeInfo.status === 'complete' && tab.active) {
//         sendPostRequestToFlask();
//     }
// }); 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "triggerApiCall") {
        sendPostRequestToFlask(); // This will call your Flask API when the trigger message is received
        sendResponse({status: "API Call triggered"}); // Send a response back to the content script
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "triggerApiCallForText") {
        sendPostRequestToFlask(); // This will call your Flask API when the trigger message is received
        sendResponse({status: "API Call triggered"}); // Send a response back to the content script
    }
});
// Listen for a message from the popup script


// Function to process and store emails
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "logEmailData") {
        // Fetch email data from chrome.storage.local
        chrome.storage.local.get("emailData", function(result) {
            if (result.emailData) {
                // Format and store emails in the global emailDocuments variable
                emailDocuments = result.emailData.map(email => {
                    const sanitizedSubject = email.subject.replace(/[\r\n]+/g, ' ').trim();
                    let sanitizedBody = email.body
                        .replace(/[\r\n]+/g, ' ')  // Remove new lines
                        .replace(/\s+/g, ' ')      // Collapse whitespace
                        .replace(/['"]+/g, '')     // Remove both single and double quotes
                        .split('>')[0]             // Remove quoted replies
                        .trim();
                    return `Subject: ${sanitizedSubject} Body: ${sanitizedBody}`;
                });                
                console.log("Documents being sent to Flask API:", emailDocuments);
                console.log("Email data formatted and stored in emailDocuments:", emailDocuments);
                sendResponse({status: "Email data formatted and stored."});
            } else {
                console.log("No email data found in storage.");
                sendResponse({status: "No stored emails found to process."});
            }
        });
        return true; // Keep the messaging channel open for sendResponse
    }
});



