let skipSuggestion = false; // Flag to temporarily disable suggestions after inserting
let userTypedText = ""; // Global string to store the actual user-typed text
let initialSuggestion = "";
let subjectLine = ""; // Global variable to store the subject line
let UPDATETIMEOUT;  // Timeout to trigger the API call after 5 seconds of subject line inactivity

function triggerApiCall() {
    chrome.runtime.sendMessage({action: "triggerApiCall"}, (response) => {
        console.log("API Call triggered:", response.status);
    });
}

function triggerApiCallForText() {
    chrome.runtime.sendMessage({action: "triggerApiCallForText"}, (response) => {
        console.log("API Call triggered:", response.status);
    });
}

// window.addEventListener('load', () => {
//     triggerApiCall(); // Trigger the API call when the page is fully loaded
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "logResponse") {
        initialSuggestion = message.data;
        console.log("Initial suggestion:", parseApiResponse(initialSuggestion));
    }
    sendResponse({status: "Message received"});
});

function parseApiResponse(initialSuggestion) {
    try {
        let cons = JSON.parse(initialSuggestion);
        if (!cons || !cons.response) {
            console.error("Invalid response format");
            return initialSuggestion; // Return raw data if format is invalid
        }

        let responseText = cons.response;
        responseText = responseText.replace(/\\"/g, '"');
        responseText = responseText.replace(/\\n/g, '\n');
        responseText = responseText.replace(/(?<!\n)(\.|\?|\!)(?=\s[A-Z])/g, '$1\n');
        responseText = responseText.replace(/\s+/g, ' ').trim();

        return responseText;
    } catch (e) {
        console.error("Failed to parse response JSON:", e);
        return initialSuggestion; // Return raw data if parsing fails
    }
}


function clearandshowInitialSuggestion(bodyArea) {
    bodyArea.textContent = ''; // Clear any existing content
    const suggestionSpan = document.createElement('span');
    suggestionSpan.style.color = "rgba(0, 0, 0, 0.5)";
    suggestionSpan.style.pointerEvents = "none";
    suggestionSpan.className = "dynamic-suggestion-body";
    const intervalId = setInterval(() => {
        if (initialSuggestion) {
            suggestionSpan.textContent = parseApiResponse(initialSuggestion);
            clearInterval(intervalId);
        }
    }, 1000); // Check every second
    initialSuggestion = "";
    bodyArea.appendChild(suggestionSpan);
    return suggestionSpan;
}

/**
 * Function to show the initial suggestion if the body is empty
 * @param {HTMLElement} bodyArea - The compose body area element
 * @returns {HTMLElement|null} - The suggestion span element or null if not applicable
 */
function showInitialSuggestion(bodyArea) {
    if (bodyArea.textContent.trim() === '') {
        return clearandshowInitialSuggestion(bodyArea);
    }
    return null;
}

/**
 * Function to handle the backtick (`) key functionality to insert the suggestion text
 * @param {HTMLElement} bodyArea - The compose body area element
 */
function handleBacktickKey(bodyArea) {
    bodyArea.addEventListener('keydown', (e) => {
        if (e.key === '`') {
            e.preventDefault(); // Prevent the default backtick behavior

            const suggestionSpan = bodyArea.querySelector('.dynamic-suggestion-body');
            if (suggestionSpan) {
                // Insert the suggestion as part of the actual text
                const suggestionText = suggestionSpan.textContent;
                suggestionSpan.remove(); // Remove the suggestion before inserting to avoid duplicates

                // Insert the suggestion text at the current cursor position
                insertTextAtCursor(bodyArea, suggestionText);

                setEndOfContenteditable(bodyArea); // Move cursor to the end of the text
                skipSuggestion = true; // Set flag to skip the next suggestion
                updateUserTypedText(bodyArea); // Update the global user-typed text
            }
        }
    });
}

/**
 * Function to insert text at the current cursor position
 * @param {HTMLElement} element - The contenteditable element
 * @param {string} text - The text to insert
 */
function insertTextAtCursor(element, text) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

/**
 * Function to place the cursor at the end of the contenteditable area
 * @param {HTMLElement} contentEditableElement - The contenteditable element
 */
function setEndOfContenteditable(contentEditableElement) {
    let range, selection;
    if (document.createRange) {
        range = document.createRange();
        range.selectNodeContents(contentEditableElement);
        range.collapse(false); // Collapse the range to the end point
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

/**
 * Function to handle typing and display a new suggestion after a delay
 * @param {HTMLElement} bodyArea - The compose body area element
 */
function handleTypingDelay(bodyArea) {
    let typingTimer;
    bodyArea.addEventListener('input', (e) => {
        if (skipSuggestion) {
            skipSuggestion = false; // Reset the flag
            return; // Skip this suggestion cycle
        }

        clearTimeout(typingTimer); // Clear any existing timer

        // Get the current user text
        const userText = bodyArea.textContent.trim();

        // Remove any existing suggestion
        const existingSuggestion = bodyArea.querySelector('.dynamic-suggestion-body');
        if (existingSuggestion) {
            existingSuggestion.remove();
        }

        // Update the global user-typed text immediately after user input
        updateUserTypedText(bodyArea);

        // Delay the suggestion logic to ensure the first character is captured
        typingTimer = setTimeout(() => {
            // Before adding a new suggestion, clear any existing ones
            const allSuggestions = bodyArea.querySelectorAll('.dynamic-suggestion-body');
            allSuggestions.forEach(suggestion => suggestion.remove());

            // Create and style the new suggestion span
            const newSuggestion = document.createElement('span');
            const intervalId = setInterval(() => {
                if (initialSuggestion) {
                    newSuggestion.textContent = parseApiResponse(initialSuggestion);
                    clearInterval(intervalId);
                }
            }, 1000); // Check every second
            initialSuggestion = "";
            newSuggestion.style.color = "rgba(0, 0, 0, 0.5)";
            newSuggestion.style.pointerEvents = "none";
            newSuggestion.className = "dynamic-suggestion-body";
            bodyArea.appendChild(newSuggestion); // Append the suggestion to the body area
        }, 500); // 0.5-second delay
    });
}


/**
 * Function to update the global string with actual user-typed text
 * @param {HTMLElement} bodyArea - The compose body area element
 */
function updateUserTypedText(bodyArea) {
    const textWithoutSuggestions = Array.from(bodyArea.childNodes)
        .filter(node => !node.classList || !node.classList.contains('dynamic-suggestion-body'))
        .map(node => node.textContent || "")
        .join('');
    
    userTypedText = textWithoutSuggestions.trim();

    clearTimeout(UPDATETIMEOUT);

    // set new timeout to trigger the api call after 5 seconds
    UPDATETIMEOUT = setTimeout(() => {
        triggerApiCallForText();
    }, 1000);

    console.log("User Typed Text:", userTypedText); // Log the actual user-typed text
    sendUpdatesToBackground();
}

/**
 * Function to handle backspace and revert to the initial suggestion if necessary
 * @param {HTMLElement} bodyArea - The compose body area element
 */
function handleBackspace(bodyArea) {
    bodyArea.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            const userText = bodyArea.textContent.trim();
            const existingSuggestion = bodyArea.querySelector('.dynamic-suggestion-body');
            if (userText === '' && existingSuggestion) {
                existingSuggestion.remove(); // Remove any existing suggestion
                showInitialSuggestion(bodyArea); // Show the initial suggestion again
            }
        }
    });
}

function captureSubjectLine(composeArea) {
    const subjectArea = composeArea.querySelector('input[name="subjectbox"]');
    if (subjectArea) {
        subjectArea.addEventListener('input', (e) => {
            subjectLine = subjectArea.value.trim();
            console.log("Updated Subject Line:", subjectLine);
            
            // Clear the prev timeout if the subject line is updated again
            clearTimeout(UPDATETIMEOUT);

            // set new timeout to trigger the api call after 5 seconds
            UPDATETIMEOUT = setTimeout(() => {
                triggerApiCall();
            }, 5000);

            sendUpdatesToBackground();
        });
    }
}

function sendUpdatesToBackground() {
    chrome.runtime.sendMessage({
        action: "updateEmailContent",
        subject: subjectLine,
        body: userTypedText
    }, (response) => {
        console.log("Background response:", response);
    });
}

function addSuggestionLogic(composeArea) {
    const bodyArea = composeArea.querySelector('div[aria-label="Message Body"]');

    if (bodyArea) {
        showInitialSuggestion(bodyArea);
        handleBacktickKey(bodyArea);
        handleTypingDelay(bodyArea);
        handleBackspace(bodyArea);
        captureSubjectLine(composeArea);
    }
}

function observeComposeWindows() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const composeArea = node.querySelector('div[aria-label="Message Body"]');
                        if (composeArea) {
                            addSuggestionLogic(node);
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    const existingComposeAreas = document.querySelectorAll('div[aria-label="Message Body"]');
    existingComposeAreas.forEach(composeArea => addSuggestionLogic(composeArea.parentNode));
}

window.addEventListener('load', () => {
    observeComposeWindows();
});

