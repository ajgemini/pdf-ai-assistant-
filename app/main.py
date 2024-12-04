from flask import Flask, request, jsonify
from flask_cors import CORS
from app.processors.pdf_processor import PDFProcessor
from app.processors.ai_handler import ChromeAIHandler

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
pdf_processor = PDFProcessor()
ai_handler = ChromeAIHandler()

@app.route('/api/health-check', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/process-pdf', methods=['POST'])
def process_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    try:
        # Process PDF and get text
        text = pdf_processor.extract_text(file)
        
        # Send to Chrome AI through extension
        result = {
            'text': text,
            'status': 'processed'
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)