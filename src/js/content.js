// Function to extract email data from Gmail
function extractEmailData() {
    const emailData = {
        subject: '',
        sender: {
            name: '',
            email: '',
            domain: ''
        },
        body: '',
        urls: []
    };

    try {
        // Get email subject
        const subjectElement = document.querySelector('h2[data-thread-perm-id]');
        if (subjectElement) {
            emailData.subject = subjectElement.textContent.trim();
        }

        // Get sender information
        const senderElement = document.querySelector('.gD');
        if (senderElement) {
            emailData.sender.name = senderElement.getAttribute('name') || '';
            emailData.sender.email = senderElement.getAttribute('email') || '';
            if (emailData.sender.email) {
                emailData.sender.domain = emailData.sender.email.split('@')[1];
            }
        }

        // Get email body
        const bodyElement = document.querySelector('.a3s.aiL');
        if (bodyElement) {
            emailData.body = bodyElement.innerText;

            // Extract URLs from body
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const matches = emailData.body.match(urlRegex) || [];
            emailData.urls = matches.map(url => {
                try {
                    return new URL(url).hostname;
                } catch {
                    return url;
                }
            });
        }

        // Validate that we have at least some basic data
        if (!emailData.subject && !emailData.body) {
            console.warn('Could not find email content');
            return null;
        }

        return emailData;
    } catch (error) {
        console.error('Error extracting email data:', error);
        return null;
    }
}

async function analyzeWithOpenAI(emailData) {
    try {
        // First check if we have an API key
        const apiKeyData = await chrome.storage.local.get('openai_key');
        if (!apiKeyData.openai_key) {
            throw new Error('OpenAI API key not found. Please set your API key in the extension.');
        }

        const prompt = `Analyze this email for potential phishing attempts. Consider the sender, subject, content, and URLs:

Sender: ${emailData.sender.name} <${emailData.sender.email}>
Subject: ${emailData.subject}
URLs found: ${emailData.urls.join(', ')}

Email body:
${emailData.body}

Provide a detailed analysis in JSON format with the following structure:
{
    "isPhishing": boolean,
    "confidenceScore": number (0-100),
    "reasons": array of strings explaining why,
    "riskLevel": "low"|"medium"|"high",
    "technicalDetails": {
        "suspiciousUrls": array of suspicious URLs,
        "domainMismatch": boolean,
        "spoofingAttempt": boolean,
        "languageAnalysis": {
            "suspiciousPhrases": array of strings,
            "urgencyDetected": boolean
        }
    }
}`;

        console.log('Sending request to OpenAI API...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeyData.openai_key}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenAI API error:', errorData);
            throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response from OpenAI API');
        }

        try {
            const analysis = JSON.parse(data.choices[0].message.content);
            return analysis;
        } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError);
            throw new Error('Could not parse the AI response. The response was not in valid JSON format.');
        }
    } catch (error) {
        console.error('Error analyzing with OpenAI:', error);
        return {
            error: error.message,
            isPhishing: false,
            confidenceScore: 0,
            reasons: ['Error analyzing email: ' + error.message],
            riskLevel: 'unknown',
            technicalDetails: {
                suspiciousUrls: [],
                domainMismatch: false,
                spoofingAttempt: false,
                languageAnalysis: {
                    suspiciousPhrases: [],
                    urgencyDetected: false
                }
            }
        };
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeEmail') {
        console.log('Received analyzeEmail request');
        
        // Check if we're on a Gmail page
        if (!window.location.href.includes('mail.google.com')) {
            sendResponse({ error: 'This extension only works on Gmail' });
            return false;
        }
        
        const emailData = extractEmailData();
        if (!emailData) {
            console.error('Could not extract email data');
            sendResponse({ error: 'Could not extract email data. Make sure you have an email open.' });
            return false;
        }
        
        // Handle the async response properly
        analyzeWithOpenAI(emailData)
            .then(result => {
                console.log('Analysis complete, sending response');
                sendResponse(result);
            })
            .catch(error => {
                console.error('Error in analysis:', error);
                sendResponse({ 
                    error: 'Error analyzing email: ' + error.message,
                    riskLevel: 'unknown',
                    reasons: ['Analysis failed: ' + error.message],
                    confidenceScore: 0,
                    technicalDetails: {
                        suspiciousUrls: [],
                        domainMismatch: false,
                        spoofingAttempt: false,
                        languageAnalysis: {
                            suspiciousPhrases: [],
                            urgencyDetected: false
                        }
                    }
                });
            });
        
        return true; // Will respond asynchronously
    }
}); 