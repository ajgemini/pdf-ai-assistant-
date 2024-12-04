document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const pdfInput = document.getElementById('pdfInput');
  const processBtn = document.getElementById('processBtn');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const resultsDiv = document.getElementById('results');
  const processSpinner = document.getElementById('processSpinner');
  const summarizeSpinner = document.getElementById('summarizeSpinner');
  const processBtnText = document.getElementById('processBtnText');
  const summarizeBtnText = document.getElementById('summarizeBtnText');

  let pdfContent = null;

  // Helper function to show/hide spinner and update button text
  const toggleLoadingState = (button, spinner, textElement, isLoading, loadingText, defaultText) => {
      button.disabled = isLoading;
      spinner.style.display = isLoading ? 'inline-block' : 'none';
      textElement.textContent = isLoading ? loadingText : defaultText;
  };

  // Helper function to show result messages
  const showMessage = (message, type = 'normal') => {
      resultsDiv.className = `results ${type}`;
      
      // If the message is long, format it nicely
      if (message.length > 100) {
          resultsDiv.innerHTML = `
              <div class="summary-header">Document Summary</div>
              <div class="summary-content">${message.replace(/\n\n/g, '<br><br>')}</div>
          `;
      } else {
          resultsDiv.textContent = message;
      }
  };

  // Process PDF
  processBtn.addEventListener('click', async () => {
      const file = pdfInput.files[0];
      if (!file) {
          showMessage('Please select a PDF file first', 'error');
          return;
      }

      try {
          toggleLoadingState(processBtn, processSpinner, processBtnText, true, 'Processing...', 'Process PDF');
          
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('http://localhost:5000/api/process-pdf', {
              method: 'POST',
              body: formData
          });

          if (!response.ok) {
              throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.status === 'error') {
              throw new Error(data.error || 'Failed to process PDF');
          }

          pdfContent = data.text;
          summarizeBtn.disabled = false;
          showMessage('PDF processed successfully. Click Summarize to generate summary.', 'success');
          
      } catch (error) {
          console.error('Error:', error);
          showMessage(`Error: ${error.message}. Please make sure the Flask server is running.`, 'error');
          summarizeBtn.disabled = true;
      } finally {
          toggleLoadingState(processBtn, processSpinner, processBtnText, false, 'Process PDF', 'Process PDF');
      }
  });

  // Generate summary
  summarizeBtn.addEventListener('click', async () => {
      if (!pdfContent) {
          showMessage('Please process a PDF first', 'error');
          return;
      }

      try {
          toggleLoadingState(summarizeBtn, summarizeSpinner, summarizeBtnText, true, 'Summarizing...', 'Summarize');
          showMessage('Generating summary...');

          chrome.runtime.sendMessage(
              { 
                  type: 'generateSummary', 
                  text: pdfContent 
              },
              (response) => {
                  if (chrome.runtime.lastError) {
                      throw new Error(chrome.runtime.lastError.message);
                  }

                  if (response.status === 'success' && response.summary) {
                      showMessage(response.summary);
                  } else {
                      showMessage(`Error: ${response.error || 'Failed to generate summary'}`, 'error');
                  }
                  toggleLoadingState(summarizeBtn, summarizeSpinner, summarizeBtnText, false, 'Summarize', 'Summarize');
              }
          );
      } catch (error) {
          console.error('Error:', error);
          showMessage(`Error generating summary: ${error.message}`, 'error');
          toggleLoadingState(summarizeBtn, summarizeSpinner, summarizeBtnText, false, 'Summarize', 'Summarize');
      }
  });

  // File input change handler
  pdfInput.addEventListener('change', () => {
      const file = pdfInput.files[0];
      if (file) {
          showMessage(`Selected file: ${file.name}. Click Process PDF to continue.`);
          summarizeBtn.disabled = true;
      } else {
          showMessage('Select a PDF file to begin');
      }
  });
});