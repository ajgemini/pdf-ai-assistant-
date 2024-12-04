from PyPDF2 import PdfReader

class PDFProcessor:
    def extract_text(self, pdf_file):
        """Extract text from PDF file."""
        try:
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            raise Exception(f"PDF processing error: {str(e)}")