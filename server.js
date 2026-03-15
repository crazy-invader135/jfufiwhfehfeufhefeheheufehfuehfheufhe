const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- CONFIGURATION ---
const SECRET_KEY = "MySuperSecret123"; 
const ADMIN_USERNAME = "YourUsernameHere"; // <--- PUT YOUR USERNAME HERE
let pendingCommand = null;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Roblox Admin Panel</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 20px; background: #121212; color: white; text-align: center; }
                .container { max-width: 600px; margin: auto; }
                .section { background: #1e1e1e; padding: 20px; margin-bottom: 15px; border-radius: 12px; border: 1px solid #333; }
                h1 { color: #007bff; }
                input, textarea { 
                    width: 90%; padding: 12px; margin: 10px 0; 
                    background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 6px; 
                }
                button { 
                    padding: 10px 20px; margin: 5px; border: none; border-radius: 6px; 
                    cursor: pointer; font-weight: bold; transition: 0.3s;
                }
                .btn-primary { background: #007bff; color: white; }
                .btn-admin { background: #6f42c1; color: white; } /* Purple for Admin focus */
                .btn-green { background: #28a745; color: white; }
                .btn-red { background: #dc3545; color: white; }
                button:hover { opacity: 0.8; transform: scale(1.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Roblox Command Center</h1>
                <p>Whitelisted Admin: <b style="color: #6f42c1;">${ADMIN_USERNAME}</b></p>

                <div class="section">
                    <h3>Targeting</h3>
                    <input type="text" id="targetUser" placeholder="Enter Username...">
                    <br>
                    <button class="btn-admin" onclick="document.getElementById('targetUser').value = '${ADMIN_USERNAME}'">Target Me</button>
                    <button class="btn-red" onclick="document.getElementById('targetUser').value = ''">Clear Target</button>
                </div>

                <div class="section">
                    <h3>Commands</h3>
                    <button class="btn-primary" onclick="sendCommand('Kill')">Kill</button>
                    <button class="btn-primary" onclick="sendCommand('Freeze')">Freeze</button>
                    <button class="btn-primary" onclick="sendCommand('Thaw')">Unfreeze</button>
                    <button class="btn-green" onclick="sendCommand('LoadWatermark')">Give Watermark</button>
                    <button class="btn-red" onclick="sendCommand('Kick')">Kick</button>
                </div>

                <div class="section">
                    <h3>Executor</h3>
                    <textarea id="luaCode" placeholder="-- Enter Lua Code..."></textarea>
                    <button class="btn-green" onclick="sendLua()" style="width: 100%;">Execute Script</button>
                </div>
            </div>

            <script>
                async function sendCommand(cmd) {
                    const target = document.getElementById('targetUser').value;
                    const res = await fetch('/send-command', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ cmd, key: "${SECRET_KEY}", target })
                    });
                    if(res.ok) console.log("Sent: " + cmd);
                }

                async function sendLua() {
                    const script = document.getElementById('luaCode').value;
                    await fetch('/send-command', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ cmd: 'CustomScript', key: "${SECRET_KEY}", script })
                    });
                    alert("Script Deployed");
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/send-command', (req, res) => {
    const { cmd, key, target, script } = req.body;
    if (key === SECRET_KEY) {
        pendingCommand = { command: cmd, target, script };
        console.log(`Command [${cmd}] set for ${target || "Everyone"}`);
        res.json({ success: true });
    } else {
        res.status(403).send("Unauthorized");
    }
});

app.get('/get-commands', (req, res) => {
    if (pendingCommand) {
        res.json(pendingCommand);
        pendingCommand = null;
    } else {
        res.json({ command: "none" });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log("Website Online"));
