Summary : Load the app to chrome and grab the extension ID, then proceed to grab a google Oauth Client ID for the Gmail Api, and insert it into the manifest file. And pass in your Gemini api key to the Server.py file. To proceed, click on the extension, and press fetch sent emails(The app will prompt access to your gmail account, as logging in is necessary) and log stored emails. After that, we should be able to just open gmail, compose, and put a subject line or body and the suggestions will start being recommending. Pressing "`" will fill in the suggestion and further typing will allow Gemini to understand what direction you want to proceed and give tailored  suggestions that reflect your distinct writing style and the current email's content. Thats all. Thanks!


# Chrome Extension Setup and Gmail API Integration

## Steps to Set Up

1. **Load the Extension**  
   Load the extension into Chrome and grab the extension ID.

2. **Obtain Google OAuth Client ID**  
   Acquire a Google OAuth Client ID for the Gmail API.

3. **Insert OAuth Client ID**  
   Add the obtained OAuth Client ID into the extension's `manifest.json` file.

4. **Set Up Gemini API Key**  
   Insert your Gemini API key into the `Server.py` file.

## Using the Extension

1. **Access Extension Features**  
   - Click on the extension icon in Chrome.
   - Press "Fetch Sent Emails" (the app will prompt for access to your Gmail account; logging in is necessary).

2. **Logging Stored Emails**  
   The app will log stored emails after access is granted.

3. **Composing Emails with Suggestions**  
   - Open Gmail and start composing a new email.
   - Type in the subject line or body text, and suggestions will begin appearing.
   - Pressing "`" will fill in the suggested text.
   - Continue typing to allow Gemini to provide tailored suggestions based on your distinct writing style and the current email's content.


## Demo

- Dolly in action! <br>

![Gif1DOlly-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/79e28fcd-7a1a-4447-bcb7-630bdde7c670)

![Gif2DOlly-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/671e642d-5237-4a3e-9155-a5fa21617c81)
