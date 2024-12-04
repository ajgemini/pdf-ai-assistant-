document.addEventListener('DOMContentLoaded', function() {
    // Add test button at the top
    const testDiv = document.createElement('div');
    testDiv.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button id="testAI" style="margin-right: 10px;">Test AI</button>
            <button id="checkStatus">Check Status</button>
            <div id="statusDisplay" style="margin-top: 10px;"></div>
        </div>
    `;
    document.body.insertBefore(testDiv, document.body.firstChild);

    const statusDisplay = document.getElementById('statusDisplay');

    // Add status check functionality
    document.getElementById('checkStatus').addEventListener('click', async () => {
        statusDisplay.innerHTML = 'Checking AI status...';
        try {
            console.log("Window.ai object:", window.ai);
            const modelInfo = {
                hasAI: !!window.ai,
                features: window.ai ? Object.keys(window.ai) : [],
                version: await chrome.runtime.getManifest().version
            };
            
            statusDisplay.innerHTML = `
                <pre style="background: #f5f5f5; padding: 10px;">
AI Status:
- AI API Available: ${modelInfo.hasAI}
- Available Features: ${modelInfo.features.join(', ')}
- Extension Version: ${modelInfo.version}
                </pre>
            `;
        } catch (error) {
            statusDisplay.innerHTML = `Error checking status: ${error.message}`;
        }
    });

    // Add AI test functionality
    document.getElementById('testAI').addEventListener('click', async () => {
        statusDisplay.innerHTML = 'Running AI test...';
        try {
            if (!window.ai) {
                throw new Error('AI API not available');
            }

            const testText = "This is a test sentence for the AI model.";
            
            // Try to get capabilities first
            if (window.ai.summarizer) {
                const caps = await window.ai.summarizer.capabilities();
                console.log("Summarizer capabilities:", caps);
                
                if (caps.available === 'readily') {
                    const summarizer = await window.ai.summarizer.create();
                    const result = await summarizer.summarize(testText);
                    
                    statusDisplay.innerHTML = `
                        <div style="background: #e8f5e9; padding: 10px; border-radius: 4px;">
                            <p><strong>Test Text:</strong> ${testText}</p>
                            <p><strong>AI Summary:</strong> ${result}</p>
                            <p style="color: green;">✓ AI is working correctly!</p>
                        </div>
                    `;
                } else {
                    statusDisplay.innerHTML = `
                        <div style="background: #fff3e0; padding: 10px; border-radius: 4px;">
                            <p>AI not ready yet. Status: ${caps.available}</p>
                            <p>Please ensure model is downloaded in chrome://components</p>
                        </div>
                    `;
                }
            } else {
                throw new Error('Summarizer not available');
            }
        } catch (error) {
            statusDisplay.innerHTML = `
                <div style="background: #ffebee; padding: 10px; border-radius: 4px;">
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p>Please check:</p>
                    <ul>
                        <li>Chrome Canary is being used</li>
                        <li>Required flags are enabled in chrome://flags</li>
                        <li>Model is downloaded in chrome://components</li>
                    </ul>
                </div>
            `;
        }
    });
});