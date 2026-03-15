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
                body { font-family: sans-serif; padding: 20px; background: #121212; color: white; text-align: center; }
                .section { background: #1e1e1e; padding: 20px; margin-bottom: 15px; border-radius: 12px; border: 1px solid #333; }
                textarea { width: 95%; height: 150px; background: #000; border: 1px solid #444; color: #00ff00; font-family: monospace; padding: 10px; }
                input { padding: 10px; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 6px; margin: 5px; width: 80%; }
                button { padding: 12px 20px; margin: 5px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; background: #007bff; color: white; }
                .btn-green { background: #28a745; }
                .btn-red { background: #dc3545; }
            </style>
        </head>
        <body>
            <h1>Roblox Command Center</h1>
            
            <div class="section">
                <h3>Target Selection</h3>
                <input type="text" id="targetUser" placeholder="Username (Blank for Server)">
            </div>

            <div class="section">
                <h3>Whitelist System</h3>
                <button class="btn-green" onclick="joinWhitelist()">Whitelist Target</button>
            </div>

            <div class="section">
                <h3>Standard Commands</h3>
                <button class="btn-red" onclick="sendCommand('Kill')">Kill</button>
                <button class="btn-red" onclick="sendCommand('Kick')">Kick</button>
                <button onclick="sendCommand('LoadWatermark')">Watermark</button>
            </div>

            <div class="section">
                <h3>Custom Lua Executor</h3>
                <textarea id="luaCode" placeholder="print('Remote Hello!')"></textarea><br>
                <button class="btn-green" onclick="sendLua()">Execute Lua</button>
            </div>

            <script>
                async function joinWhitelist() {
                    const user = document.getElementById('targetUser').value;
                    await fetch('/add-whitelist', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ user })
                    });
                    alert("Whitelisted: " + user);
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
                    await fetch('/send-command', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ 
                            cmd: 'REMOTE_LUA_EXEC', 
                            key: "${SECRET_KEY}", 
                            payload: code,
                            target: target 
                        })
                    });
                    alert("Script Deployed");
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
        pendingCommand = { type: cmd, target, payload };
        res.json({ success: true });
    } else {
        res.status(403).send("Forbidden");
    }
});

app.get('/get-commands', (req, res) => {
    res.json({
        action: pendingCommand || { type: "none" },
        whitelist: whitelistedUsers
    });
    pendingCommand = null; 
});

app.listen(PORT, '0.0.0.0', () => console.log("Server Running"));
