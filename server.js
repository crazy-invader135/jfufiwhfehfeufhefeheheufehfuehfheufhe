const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- DATA STORAGE ---
const SECRET_KEY = "MySuperSecret123"; 
let whitelistedUsers = []; // Stores everyone who whitelists themselves
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
                .btn-whitelist { background: #ffc107; color: black; }
                .btn-green { background: #28a745; color: white; }
                .btn-red { background: #dc3545; color: white; }
                button:hover { opacity: 0.8; transform: scale(1.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Roblox Global Panel</h1>

                <div class="section">
                    <h3>Whitelist Yourself</h3>
                    <input type="text" id="selfName" placeholder="Enter Your Username...">
                    <br>
                    <button class="btn-whitelist" onclick="joinWhitelist()">Join Whitelist</button>
                </div>

                <div class="section">
                    <h3>Admin Controls</h3>
                    <input type="text" id="targetUser" placeholder="Target Player Name...">
                    <br>
                    <button class="btn-primary" onclick="sendCommand('Kill')">Kill</button>
                    <button class="btn-green" onclick="sendCommand('LoadWatermark')">Give Watermark</button>
                    <button class="btn-red" onclick="sendCommand('Kick')">Kick</button>
                </div>

                <div class="section">
                    <h3>Global Executor</h3>
                    <textarea id="luaCode" placeholder="-- Lua Script..."></textarea>
                    <button class="btn-green" onclick="sendLua()" style="width: 100%;">Execute</button>
                </div>
            </div>

            <script>
                async function joinWhitelist() {
                    const user = document.getElementById('selfName').value;
                    if(!user) return alert("Enter a name!");
                    await fetch('/add-whitelist', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ user })
                    });
                    alert(user + " added to Whitelist!");
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
                    const script = document.getElementById('luaCode').value;
                    await fetch('/send-command', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ cmd: 'CustomScript', key: "${SECRET_KEY}", script })
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// Endpoint for people to whitelist themselves
app.post('/add-whitelist', (req, res) => {
    const { user } = req.body;
    if (user && !whitelistedUsers.includes(user)) {
        whitelistedUsers.push(user);
    }
    res.json({ success: true });
});

// Roblox calls this to get the command AND the whitelist
app.get('/get-commands', (req, res) => {
    res.json({
        commandData: pendingCommand || { command: "none" },
        whitelist: whitelistedUsers
    });
    pendingCommand = null; 
});

app.post('/send-command', (req, res) => {
    const { cmd, key, target, script } = req.body;
    if (key === SECRET_KEY) {
        pendingCommand = { command: cmd, target, script };
        res.json({ success: true });
    } else {
        res.status(403).send("Forbidden");
    }
});

app.listen(PORT, '0.0.0.0', () => console.log("Server Running"));
