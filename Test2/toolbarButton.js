let isDarkBackground = false; // Variable to track background state
let isCasualTone = false; // Variable to track Casual Tone state

function toggleBackgroundAndLog(composeWindow) {
    // Toggle the background color (used here to simulate Formal Tone)
    isDarkBackground = !isDarkBackground;
    document.body.style.backgroundColor = isDarkBackground ? '#333' : '#fff';

    // Log the current state to the console
    console.log("Formal Tone:", isDarkBackground);

    // Update the button text (optional, to reflect state)
    const formalButton = composeWindow.querySelector('#customGmailToolbarButton');
    if (formalButton) {
        formalButton.textContent = isDarkBackground ? 'Formal: On' : 'Formal: Off';
    }
}

function toggleCasualTone(composeWindow) {
    // Toggle the casual tone state
    isCasualTone = !isCasualTone;

    // Log the current state to the console
    console.log("Casual Tone:", isCasualTone);

    // Update the button text (optional, to reflect state)
    const casualButton = composeWindow.querySelector('#casualToneButton');
    if (casualButton) {
        casualButton.textContent = isCasualTone ? 'Casual: On' : 'Casual: Off';
    }
}

function promptGemini() {
    // Log the action to the console (you can replace this with actual functionality)
    console.log("Gemini prompt triggered.");
    // Here you would add the code to trigger Gemini's functionality
}

function addToolbarButton(composeWindow) {
    // Check if the button already exists
    if (composeWindow.querySelector('#customGmailToolbarButton')) {
        console.log("Button already exists.");
        return;
    }

    console.log("Adding custom toolbar buttons...");

    // Find the paperclip button (attachment) as a reference point
    const attachmentButton = composeWindow.querySelector('div[aria-label="Attach files"]');

    if (!attachmentButton) {
        console.log("Attachment button not found.");
        return;
    }

    // Create the Formal Tone button
    const formalButton = document.createElement('button');
    formalButton.id = 'customGmailToolbarButton';
    formalButton.textContent = 'Formal Tone';
    formalButton.style.marginRight = '8px';
    formalButton.style.cursor = 'pointer';
    formalButton.style.padding = '4px 8px';
    formalButton.style.border = '1px solid #4285F4';
    formalButton.style.borderRadius = '4px';
    formalButton.style.backgroundColor = '#F8F9FA'; // Light shade of white
    formalButton.style.color = '#4285F4';
    formalButton.style.zIndex = '1000'; // Ensure it is above other elements
    formalButton.style.transition = 'background-color 0.3s, filter 0.3s'; // Smooth transition for hover/active effects

    // Add hover and active effects
    formalButton.addEventListener('mouseover', function() {
        formalButton.style.backgroundColor = '#E3F2FD'; // Lighter blue background on hover
    });
    formalButton.addEventListener('mouseout', function() {
        formalButton.style.backgroundColor = '#F8F9FA';
    });
    formalButton.addEventListener('mousedown', function() {
        formalButton.style.filter = 'invert(100%)';
    });
    formalButton.addEventListener('mouseup', function() {
        formalButton.style.filter = 'none';
    });

    // Add click action to the button
    formalButton.addEventListener('click', function() {
        toggleBackgroundAndLog(composeWindow);
    });

    // Create the Casual Tone button
    const casualButton = document.createElement('button');
    casualButton.id = 'casualToneButton';
    casualButton.textContent = 'Casual Tone';
    casualButton.style.marginRight = '8px';
    casualButton.style.cursor = 'pointer';
    casualButton.style.padding = '4px 8px';
    casualButton.style.border = '1px solid #34A853';
    casualButton.style.borderRadius = '4px';
    casualButton.style.backgroundColor = '#F8F9FA'; // Light shade of white
    casualButton.style.color = '#34A853';
    casualButton.style.zIndex = '1000';
    casualButton.style.transition = 'background-color 0.3s, filter 0.3s';

    // Add hover and active effects
    casualButton.addEventListener('mouseover', function() {
        casualButton.style.backgroundColor = '#E6F4EA'; // Lighter green background on hover
    });
    casualButton.addEventListener('mouseout', function() {
        casualButton.style.backgroundColor = '#F8F9FA';
    });
    casualButton.addEventListener('mousedown', function() {
        casualButton.style.filter = 'invert(100%)';
    });
    casualButton.addEventListener('mouseup', function() {
        casualButton.style.filter = 'none';
    });

    // Add click action to the button
    casualButton.addEventListener('click', function() {
        toggleCasualTone(composeWindow);
    });

    // Create the Prompt Gemini button
    const geminiButton = document.createElement('button');
    geminiButton.id = 'promptGeminiButton';
    geminiButton.textContent = 'Prompt Gemini';
    geminiButton.style.marginRight = '8px';
    geminiButton.style.cursor = 'pointer';
    geminiButton.style.padding = '4px 8px';
    geminiButton.style.border = '1px solid #EA4335';
    geminiButton.style.borderRadius = '4px';
    geminiButton.style.backgroundColor = '#F8F9FA'; // Light shade of white
    geminiButton.style.color = '#EA4335';
    geminiButton.style.zIndex = '1000';
    geminiButton.style.transition = 'background-color 0.3s, filter 0.3s';

    // Add hover and active effects
    geminiButton.addEventListener('mouseover', function() {
        geminiButton.style.backgroundColor = '#FCE8E6'; // Lighter red background on hover
    });
    geminiButton.addEventListener('mouseout', function() {
        geminiButton.style.backgroundColor = '#F8F9FA';
    });
    geminiButton.addEventListener('mousedown', function() {
        geminiButton.style.filter = 'invert(100%)';
    });
    geminiButton.addEventListener('mouseup', function() {
        geminiButton.style.filter = 'none';
    });

    // Add click action to the button
    geminiButton.addEventListener('click', function() {
        promptGemini();
    });

    // Insert the buttons next to the attachment button
    attachmentButton.parentNode.insertBefore(formalButton, attachmentButton.nextSibling);
    attachmentButton.parentNode.insertBefore(casualButton, formalButton.nextSibling);
    attachmentButton.parentNode.insertBefore(geminiButton, casualButton.nextSibling);

    console.log("Custom toolbar buttons added successfully.");
}

// Function to monitor for Gmail compose windows
function monitorComposeWindows() {
    const composeWindows = document.querySelectorAll('div[role="dialog"]');
    composeWindows.forEach(function(composeWindow) {
        addToolbarButton(composeWindow);
    });
}

// Set up a MutationObserver to monitor changes in the Gmail UI
const observer = new MutationObserver(monitorComposeWindows);

// Start observing the body for changes in the Gmail UI
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

// Initial call to handle any existing compose windows
monitorComposeWindows();
