# ![Securo Logo](src/icons/securo-logo-revised.svg)

# Securo - Gmail Phishing Detector

A Chrome extension that analyzes Gmail emails for potential phishing attempts with a single click. No login or configuration required.

## Features

- Automatic email data extraction from Gmail
- Phishing detection analysis:
  - Sender domain verification
  - Suspicious phrase detection
  - URL analysis
  - Confidence scoring
- User-friendly results display
- No setup or configuration needed

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Open Gmail in Chrome
2. Open an email you want to analyze
3. Click the Securo extension icon in your browser toolbar
4. View the analysis results in the popup

## How It Works

The extension analyzes several factors to determine if an email might be a phishing attempt:

- Verifies if the sender's domain matches claimed company domains
- Checks for common phishing phrases and urgency indicators
- Analyzes URLs for suspicious patterns or redirects
- Provides a confidence score based on multiple factors

## Privacy

This extension:
- Works entirely locally in your browser
- Doesn't send any data to external servers
- Doesn't require any login or API keys
- Only accesses email data when you click the extension icon

## Development

The extension is built using vanilla JavaScript and Chrome Extension APIs. To modify or enhance the extension:

1. Edit the relevant files:
   - `manifest.json`: Extension configuration
   - `popup.html/js`: UI and interaction
   - `content.js`: Email analysis logic
2. Reload the extension in Chrome to test changes

## License

MIT License - Feel free to modify and use as needed. 
