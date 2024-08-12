document.getElementById('authButton').addEventListener('click', function() {
    // Check if email data already exists
    chrome.storage.local.get("emailData", function(result) {
        if (result.emailData) {
            console.log("Email data already stored:", result.emailData);
            displayStatusMessage('Emails already fetched and stored.');
            document.getElementById('authButton').innerText = "Already Fetched";
            document.getElementById('authButton').style.backgroundColor = "#4CAF50";
            // You can choose to display the data or just indicate it's already stored
            return;
        } else {
            // No stored data, proceed with authorization and fetching
            authorizeAndFetchEmails();
        }
    });
});

function authorizeAndFetchEmails() {
    document.getElementById('authButton').innerText = "Fetching...";
    document.getElementById('authButton').style.backgroundColor = "#FFA500";
    displayStatusMessage('Authenticating and fetching emails...');

    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
            console.log('Authentication error:', chrome.runtime.lastError.message);
            displayStatusMessage('Authentication failed. Please try again.');
            document.getElementById('authButton').innerText = "Auth Failed";
            document.getElementById('authButton').style.backgroundColor = "#FF6347";
            return;
        }

        if (!token) {
            console.log('No token retrieved.');
            displayStatusMessage('Failed to retrieve authentication token. Please try again.');
            document.getElementById('authButton').innerText = "Auth Failed";
            document.getElementById('authButton').style.backgroundColor = "#FF6347";
            return;
        }

        console.log('Authentication successful. Token:', token);
        fetchEmails(token); // Now that we have the token, fetch the emails
    });
}

function fetchEmails(token) {
    const query = "in:sent";
    const maxResults = 100;
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=${maxResults}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (!data.messages || data.messages.length === 0) {
            console.log('No sent emails found.');
            displayStatusMessage('No sent emails found.');
            document.getElementById('authButton').innerText = "No Emails Found";
            document.getElementById('authButton').style.backgroundColor = "#FF6347";
            return;
        }

        console.log('Fetched email data:', data);
        const messages = data.messages || [];
        const emailData = [];

        const fetchPromises = messages.map(message => 
            fetchMessageDetails(token, message.id, emailData)
        );

        Promise.all(fetchPromises)
            .then(() => {
                // Store the email data in chrome.storage.local
                chrome.storage.local.set({ "emailData": emailData }, function() {
                    console.log("Email data saved in local storage.");
                    displayStatusMessage('Emails successfully fetched and stored locally!');
                    document.getElementById('authButton').innerText = "Fetched";
                    document.getElementById('authButton').style.backgroundColor = "#4CAF50";
                });
            })
            .catch(error => {
                console.error('Error fetching email details:', error);
                displayStatusMessage('Error fetching email details. Please try again.');
                document.getElementById('authButton').innerText = "Fetch Failed";
                document.getElementById('authButton').style.backgroundColor = "#FF6347";
            });
    })
    .catch(error => {
        console.error('Error during email fetching:', error);
        displayStatusMessage('Failed to fetch emails. Please try again.');
        document.getElementById('authButton').innerText = "Fetch Failed";
        document.getElementById('authButton').style.backgroundColor = "#FF6347";
    });
}

function fetchMessageDetails(token, messageId, emailData) {
    return new Promise((resolve, reject) => {
        const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(message => {
            if (!message.payload || !message.payload.headers) {
                console.log('No headers found in message:', message);
                emailData.push({
                    subject: "[No Subject Found]",
                    body: "[No Body Found]"
                });
                resolve();
                return;
            }

            const headers = message.payload.headers;
            const bodyData = message.payload.parts ? message.payload.parts[0].body.data : message.payload.body.data;

            let decodedBody = '';
            if (bodyData) {
                try {
                    decodedBody = decodeURIComponent(escape(atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'))));
                } catch (error) {
                    console.error('Error decoding body data:', error);
                    decodedBody = '[Error decoding body data]';
                }
            } else {
                decodedBody = '[No body content found]';
            }

            const subjectHeader = headers.find(header => header.name === "Subject");
            const subject = subjectHeader ? subjectHeader.value : "No Subject";

            emailData.push({
                subject: subject,
                body: decodedBody
            });

            resolve();
        })
        .catch(error => {
            console.error('Error fetching email details:', error);
            reject(error);
        });
    });
}

function displayStatusMessage(message) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.innerText = message;
}

// Add this function to the bottom of your existing popup.js
document.getElementById('logEmailsButton').addEventListener('click', function() {
    // Send a message to the background script to log the email data
    chrome.runtime.sendMessage({action: "logEmailData"}, function(response) {
        console.log(response.status);
        displayStatusMessage(response.status);
    });
});
