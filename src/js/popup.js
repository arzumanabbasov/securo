document.addEventListener('DOMContentLoaded', async () => {
    const apiKeySection = document.getElementById('api-key-section');
    const analysisSection = document.getElementById('analysis-section');
    const apiKey = await chrome.storage.local.get('openai_key');

    if (!apiKey.openai_key) {
        apiKeySection.style.display = 'block';
        analysisSection.style.display = 'none';
        setupApiKeyForm(apiKeySection, analysisSection);
        return;
    }

    apiKeySection.style.display = 'none';
    analysisSection.style.display = 'block';
    analyzeCurrentEmail();
});

function setupApiKeyForm(apiKeySection, analysisSection) {
    const saveButton = document.getElementById('save-key');
    const apiKeyInput = document.getElementById('api-key');

    saveButton.addEventListener('click', async () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
            alert('Please enter a valid API key');
            return;
        }

        await chrome.storage.local.set({ 'openai_key': key });
        apiKeySection.style.display = 'none';
        analysisSection.style.display = 'block';
        analyzeCurrentEmail();
    });
}

function analyzeCurrentEmail() {
    // Get the active tab and analyze the email
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab.url.includes('mail.google.com')) {
            showError('Please open this extension while viewing an email in Gmail.');
            return;
        }

        // Show loading state
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="loading">
                Analyzing email with AI...
            </div>
        `;

        // Send message to content script to analyze email
        chrome.tabs.sendMessage(activeTab.id, { action: 'analyzeEmail' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Runtime error:', chrome.runtime.lastError);
                showError('Error communicating with the page. Please make sure you have an email open and refresh the page.');
                return;
            }

            if (!response) {
                showError('No response received from the content script. Please refresh the page and try again.');
                return;
            }

            if (response.error) {
                showError(response.error);
                return;
            }

            displayResults(response);
        });
    });
}

function displayResults(results) {
    const content = document.getElementById('content');
    
    // Create results HTML
    const html = `
        <div class="card">
            <div class="status ${getRiskClass(results.riskLevel)}">
                ${getStatusEmoji(results.riskLevel)} ${getRiskText(results.riskLevel)}
            </div>
            
            <div class="section">
                <div class="section-title">Analysis Results</div>
                ${results.reasons.map(reason => `
                    <div class="warning">
                        ${getReasonEmoji(reason)} ${reason}
                    </div>
                `).join('')}
            </div>
            
            ${results.technicalDetails.suspiciousUrls.length > 0 ? `
                <div class="section">
                    <div class="section-title">Suspicious URLs</div>
                    ${results.technicalDetails.suspiciousUrls.map(url => `
                        <div class="warning">🔗 ${url}</div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="section technical-details">
                <div class="section-title">Technical Analysis</div>
                <div>Domain Mismatch: ${results.technicalDetails.domainMismatch ? '⚠️ Yes' : '✅ No'}</div>
                <div>Spoofing Attempt: ${results.technicalDetails.spoofingAttempt ? '⚠️ Yes' : '✅ No'}</div>
                <div>Urgency Detected: ${results.technicalDetails.languageAnalysis.urgencyDetected ? '⚠️ Yes' : '✅ No'}</div>
                ${results.technicalDetails.languageAnalysis.suspiciousPhrases.length > 0 ? `
                    <div>Suspicious Phrases: ${results.technicalDetails.languageAnalysis.suspiciousPhrases.join(', ')}</div>
                ` : ''}
            </div>
            
            <div class="section">
                <div class="section-title">Security Level</div>
                <div class="confidence">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${results.confidenceScore}%; 
                            background-color: ${getConfidenceColor(results.confidenceScore)}">
                        </div>
                    </div>
                    <span>${results.confidenceScore}%</span>
                </div>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

function showError(message) {
    console.error('Error:', message);
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="status suspicious">
                ❌ ${message}
            </div>
            <div class="section troubleshooting">
                <div class="section-title">Troubleshooting</div>
                <ul>
                    <li>Make sure you have an email open in Gmail</li>
                    <li>Check that your OpenAI API key is valid</li>
                    <li>Try refreshing the page</li>
                    <li>Reopen the extension</li>
                </ul>
            </div>
        </div>
    `;
}

function getRiskClass(riskLevel) {
    switch (riskLevel.toLowerCase()) {
        case 'high': return 'suspicious';
        case 'medium': return 'medium';
        case 'low': return 'safe';
        default: return 'suspicious';
    }
}

function getRiskText(riskLevel) {
    switch (riskLevel.toLowerCase()) {
        case 'high': return 'High Risk - Likely Phishing Attempt';
        case 'medium': return 'Medium Risk - Exercise Caution';
        case 'low': return 'Low Risk - Email Appears Safe';
        default: return 'Unknown Risk Level';
    }
}

function getStatusEmoji(riskLevel) {
    switch (riskLevel.toLowerCase()) {
        case 'high': return '🚨';
        case 'medium': return '⚠️';
        case 'low': return '✅';
        default: return '❓';
    }
}

function getReasonEmoji(reason) {
    if (reason.toLowerCase().includes('url')) return '🔗';
    if (reason.toLowerCase().includes('domain')) return '🌐';
    if (reason.toLowerCase().includes('sender')) return '👤';
    if (reason.toLowerCase().includes('spoof')) return '🎭';
    if (reason.toLowerCase().includes('urgent')) return '⚡';
    return '⚠️';
}

function getConfidenceColor(score) {
    if (score >= 80) return 'var(--success-color)';
    if (score >= 60) return 'var(--warning-color)';
    return 'var(--danger-color)';
} 