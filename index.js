const express = require('express');
const app = express();
const path = require('path');

app.use(express.text());

let currentScript = "-- No script set yet";
let scriptId = Date.now(); // Used to tell Roblox if the script is NEW

// 1. The Frontend (Dashboard)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Roblox Remote Executor</title>
            <style>
                body { font-family: sans-serif; background: #1a1a1a; color: white; padding: 40px; }
                textarea { width: 100%; height: 300px; background: #2d2d2d; color: #00ff00; border: 1px solid #444; padding: 10px; font-family: monospace; }
                button { background: #007bff; color: white; border: none; padding: 10px 20px; cursor: pointer; margin-top: 10px; border-radius: 4px; }
                button:hover { background: #0056b3; }
                .status { margin-top: 10px; color: #aaa; }
            </style>
        </head>
        <body>
            <h1>Remote Executor</h1>
            <textarea id="code" placeholder="print('Hello from the web!')"></textarea><br>
            <button onclick="sendScript()">Execute Script</button>
            <div id="status" class="status">Ready</div>

            <script>
                async function sendScript() {
                    const code = document.getElementById('code').value;
                    const status = document.getElementById('status');
                    status.innerText = "Sending...";
                    
                    const response = await fetch('/set-script', {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain' },
                        body: code
                    });

                    if (response.ok) {
                        status.innerText = "Script Sent! Awaiting Roblox polling...";
                    } else {
                        status.innerText = "Error sending script.";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// 2. API for the Website to set the script
app.post('/set-script', (req, res) => {
    currentScript = req.body;
    scriptId = Date.now(); // Update ID so Roblox knows it's a new request
    res.send("OK");
});

// 3. API for Roblox to get the script
app.get('/get-script', (req, res) => {
    res.json({
        code: currentScript,
        id: scriptId
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
