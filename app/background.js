// Function to extract headings
function extractHeadings(text) {
  const lines = text.split('\n');
  const headings = [];
  
  const headingPatterns = [
      /^[0-9]+\.[0-9]* +[A-Z]/,
      /^[A-Z][A-Z\s]{4,}/,
      /^(?:CHAPTER|Section|Part)\s+[-–]?\s*[0-9IVX]+/i,
      /^[0-9]+\.\s+[A-Z]/
  ];

  lines.forEach(line => {
      line = line.trim();
      if (line.length > 0 && line.length < 200 &&
          headingPatterns.some(pattern => pattern.test(line))) {
          headings.push(line.trim());
      }
  });

  return headings;
}

// Function to extract document overview
function generateOverview(text) {
  const paragraphs = text.split('\n\n');
  let overview = '';
  
  for (let para of paragraphs) {
      para = para.trim();
      if (para.length > 100 && para.length < 1000 && 
          !para.toUpperCase().includes('CHAPTER') &&
          !para.match(/^[0-9]+\./)) {
          overview = para;
          break;
      }
  }
  
  return overview;
}

// Function to extract key sentences
function extractKeySentences(text, maxSentences = 1) {
  const sentences = text.split(/[.!?]+\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 300);

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq = {};
  words.forEach(word => {
      if (word.length > 3) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
  });

  const scoredSentences = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      const positionScore = 1 - (index / sentences.length);
      const wordScore = words.reduce((score, word) => {
          return score + (wordFreq[word] || 0);
      }, 0) / words.length;
      const lengthScore = Math.max(0, 1 - Math.abs(sentence.length - 100) / 100);

      return {
          sentence,
          score: (positionScore * 0.3) + (wordScore * 0.5) + (lengthScore * 0.2)
      };
  });

  return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))
      .map(item => item.sentence)
      .join('. ') + '.';
}

// Function to handle PDF processing
async function handlePDFProcessing(pdfData) {
  try {
      const chunkSize = 1000;
      const chunks = [];
      for (let i = 0; i < pdfData.length; i += chunkSize) {
          chunks.push(pdfData.slice(i, i + chunkSize));
      }
      
      return {
          processedText: chunks.join('\n'),
          processedAt: new Date().toISOString(),
          status: 'success'
      };
  } catch (error) {
      console.error('Error processing PDF:', error);
      return {
          status: 'error',
          error: error.message,
          processedAt: new Date().toISOString()
      };
  }
}

// Main summarization function
async function generateSummary(text) {
  try {
      // Get document overview
      const overview = generateOverview(text);
      
      // Extract key headings
      const headings = extractHeadings(text);
      
      // Format the summary
      let summary = 'DOCUMENT OVERVIEW:\n\n';
      summary += overview + '\n\n';
      
      if (headings.length > 0) {
          summary += 'KEY TOPICS COVERED:\n\n';
          headings.forEach(heading => {
              summary += '• ' + heading + '\n';
          });
      }

      // Extract key content
      const mainContent = text
          .replace(/\r\n/g, '\n')
          .replace(/\n\s*\n/g, '\n\n')
          .split('\n\n')
          .filter(para => para.trim().length > 100);

      const contentSummary = mainContent
          .map(section => extractKeySentences(section, 1))
          .filter(summary => summary.length > 0)
          .slice(0, 5)
          .join('\n\n');

      if (contentSummary) {
          summary += '\nKEY POINTS:\n\n' + contentSummary;
      }

      return {
          status: 'success',
          summary: summary
      };
  } catch (error) {
      console.error('Error generating summary:', error);
      return {
          status: 'error',
          error: error.message || 'Failed to generate summary'
      };
  }
}

// Message listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'processPDF') {
      handlePDFProcessing(request.pdfData)
          .then(result => sendResponse(result))
          .catch(error => sendResponse({ 
              status: 'error', 
              error: error.message 
          }));
      return true;
  } 
  else if (request.type === 'generateSummary') {
      if (!request.text) {
          sendResponse({
              status: 'error',
              error: 'No text provided for summarization'
          });
          return true;
      }

      generateSummary(request.text)
          .then(result => sendResponse(result))
          .catch(error => sendResponse({
              status: 'error',
              error: error.message || 'Failed to generate summary'
          }));
      return true;
  }
});

// Handle sidebar opening
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});