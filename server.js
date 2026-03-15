const express = require('express');
const app = express();

// Render will automatically provide a PORT, or it uses 3000 locally
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- CONFIGURATION ---
const SECRET_KEY = "MySuperSecret123"; // Keep this secret!
let pendingCommand = null;

// --- 1. WEB INTERFACE (HTML/JS) ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Roblox Remote Admin</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: #1a1a1a; color: white; }
                .container { max-width: 800px; margin: auto; }
                .section { background: #2d2d2d; padding: 20px; margin-bottom: 15px; border-radius: 10px; border-left: 5px solid #007bff; }
                h1 { color: #007bff; text-align: center; }
                h3 { margin-top: 0; color: #ddd; }
                input, textarea { 
                    width: 100%; padding: 10px; margin: 10px 0; 
                    background: #3d3d3d; border: 1px solid #555; color: white; border-radius: 5px; 
                }
                textarea { height: 120px; font-family: monospace; }
                button { 
                    padding: 10px 15px; margin: 5px; border: none; border-radius: 5px; 
                    cursor: pointer; font-weight: bold; transition: 0.2s; 
                }
                .btn-blue { background: #007bff; color: white; }
                .btn-blue:hover { background: #0056b3; }
                .btn-red { background: #dc3545; color: white; }
                .btn-red:hover { background: #a71d2a; }
                .btn-green { background: #28a745; color: white; }
                .btn-green:hover { background: #218838; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Roblox Command Center</h1>

                <div class="section">
                    <h3>1. Target Controls</h3>
                    <input type="text" id="targetUser" placeholder="Username (Leave empty for Global)">
                    <div>
                        <button class="btn-blue" onclick="sendCommand('Kill')">Kill</button>
                        <button class="btn-blue" onclick="sendCommand('Freeze')">Freeze</button>
                        <button class="btn-blue" onclick="sendCommand('Thaw')">Unfreeze</button>
                        <button class="btn-blue" onclick="sendCommand('Heal')">Heal</button>
                        <button class="btn-red" onclick="sendCommand('Kick')">Kick Player</button>
                    </div>
                </div>

                <div class="section">
                    <h3>2. Visual Effects</h3>
                    <button class="btn-blue" onclick="sendCommand('Fire')">Fire</button>
                    <button class="btn-blue" onclick="sendCommand('Sparkles')">Sparkles</button>
                    <button class="btn-blue" onclick="sendCommand('BigHead')">Big Head</button>
                    <button class="btn-blue" onclick="sendCommand('NormalHead')">Normal Head</button>
                </div>

                <div class="section">
                    <h3>3. Environment & World</h3>
                    <button class="btn-blue" onclick="sendCommand('DayTime')">Set Noon</button>
                    <button class="btn-blue" onclick="sendCommand('NightTime')">Set Night</button>
                    <button class="btn-blue" onclick="sendCommand('Announcement')">Broadcast Hello</button>
                </div>

                <div class="section">
                    <h3>4. Custom Lua Executor</h3>
                    <textarea id="luaCode" placeholder="-- Type any Lua code here...\\ngame.Workspace.Baseplate.Transparency = 0.5"></textarea>
                    <button class="btn-green" onclick="sendLua()">Execute Custom Script</button>
                </div>
            </div>

            <script>
                async function sendCommand(cmd) {
                    const target = document.getElementById('targetUser').value;
                    const response = await fetch('/send-command', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ cmd, key: "${SECRET_KEY}", target })
                    });
                    if(response.ok) console.log("Command sent: " + cmd);
                }

                async function sendLua() {
                    const script = document.getElementById('luaCode').value;
                    const response = await fetch('/send-command', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ cmd: 'CustomScript', key: "${SECRET_KEY}", script })
                    });
                    if(response.ok) {
                        alert('Lua Script Sent!');
                        document.getElementById('luaCode').value = '';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// --- 2. THE API ENDPOINTS ---

// Receives commands from the Website UI
app.post('/send-command', (req, res) => {
    const { cmd, key, target, script } = req.body;

    if (key !== SECRET_KEY) {
        return res.status(403).json({ success: false, error: "Invalid Key" });
    }

    pendingCommand = { 
        command: cmd, 
        target: target || null, 
        script: script || null 
    };

    console.log(`[QUEUED] ${cmd} targeting ${target || 'Everyone'}`);
    res.json({ success: true });
});

// Roblox calls this to check for new commands
app.get('/get-commands', (req, res) => {
    if (pendingCommand) {
        res.json(pendingCommand);
        pendingCommand = null; // Clear queue after Roblox downloads it
    } else {
        res.json({ command: "none" });
    }
});

// --- 3. START SERVER ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Website is live on port ${PORT}`);
});
