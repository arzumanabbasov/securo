# <img src="src/icons/securo-logo-revised.svg" alt="Securo Logo" width="40"> Securo - Gmail Phishing Detector

A Chrome extension that analyzes Gmail emails for potential phishing attempts with a single click. No login or configuration required.

---

## Features

- Automatic email data extraction from Gmail  
- Phishing detection analysis, including:  
  - Sender domain verification  
  - Suspicious phrase detection  
  - URL analysis  
  - Confidence scoring  
- User-friendly results display  
- No setup or configuration needed  

---

## Installation

1. Download or clone this repository  
2. Open Chrome and navigate to `chrome://extensions/`  
3. Enable "Developer mode" in the top right  
4. Click "Load unpacked" and select the extension directory  

---

## Usage

1. Open Gmail in Chrome  
2. Open an email you want to analyze  
3. Click the Securo extension icon in your browser toolbar  
4. View the analysis results in the popup  

---

## How It Works

The extension analyzes multiple factors to detect potential phishing attempts:

- **Domain Verification**: Checks if the sender's domain matches claimed company domains  
- **Suspicious Language Detection**: Identifies urgent requests, threats, or manipulation tactics  
- **URL Analysis**: Detects suspicious patterns, redirects, or fake websites  
- **Confidence Scoring**: Provides a risk assessment based on multiple factors  

---

## Privacy

- Works entirely locally in your browser  
- No data is sent to external servers  
- No login or API keys required  
- Only accesses email data when you click the extension icon  

---

## Development

The extension is built using vanilla JavaScript and Chrome Extension APIs. To modify or enhance the extension:

1. Edit the relevant files:
   - `manifest.json`: Extension configuration  
   - `popup.html/js`: UI and interaction logic  
   - `content.js`: Email analysis logic  
2. Reload the extension in Chrome to test changes  

---

## License

MIT License - You are free to modify and use this extension as needed.
