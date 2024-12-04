// This file handles any content script operations
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'extractText') {
      // Handle any page content extraction if needed
      sendResponse({status: 'success'});
    }
  });