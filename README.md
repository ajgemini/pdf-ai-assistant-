# PDF AI Assistant

## Overview

The PDF AI Assistant is a Chrome extension that enables users to efficiently process and summarize information from business process documents using the latest AI and natural language processing capabilities.

## Features

- **PDF Processing**: The extension allows users to upload PDF files and extracts the text content for further processing.
- **AI-Powered Summarization**: By leveraging the Chrome browser's built-in AI models, the extension can generate concise and informative summaries of the key points in the uploaded documents.
- **User-Friendly Interface**: The extension provides a clean and intuitive user interface for uploading files, initiating document processing, and viewing the generated summaries.

## Technologies Used

The PDF AI Assistant is built using the following technologies:

- **Backend**: Python, Flask
- **Frontend**: JavaScript, Chrome Extension
- **PDF Processing**: PyPDF2
- **AI Summarization**: OpenAI language models accessed through the Chrome AI APIs
- **UI**: Streamlit

## Installation and Usage

1. Install the PDF AI Assistant Chrome extension from the Chrome Web Store (link to be added).
2. Open the extension in your Chrome browser.
3. Click the "Process PDF" button and select a PDF file to upload.
4. Once the file is processed, click the "Summarize" button to generate a summary of the document.
5. The summary will be displayed in the extension's interface.

## Development

To run the PDF AI Assistant project locally, follow these steps:

1. 
2. Navigate to the project directory: `cd pdf-ai-assistant`
3. Install the required dependencies: `pip install -r requirements.txt`
4. Start the Flask backend server: `python app/main.py`
5. Load the Chrome extension in your browser:
   - Open the Chrome browser and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `pdf-ai-assistant/app` directory
6. Interact with the PDF AI Assistant through the Chrome extension.

## Contributing

Contributions to the PDF AI Assistant project are welcome. If you encounter any issues or have suggestions for improvements, please feel free to open a new issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).