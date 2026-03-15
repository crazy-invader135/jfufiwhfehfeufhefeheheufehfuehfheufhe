const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const SECRET_KEY = "MySuperSecret123"; 
let pendingCommand = null;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Roblox Remote Admin</title>
            <style>
                body { font-family: sans-serif; padding: 20px; background: #1a1a1a; color: white; }
                .section { background: #2d2d2d; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 5px solid #007bff; }
                input, textarea { width: 100%; padding: 10px; margin: 10px 0; background: #3d3d3d; border: 1px solid #555; color: white; }
                button { padding: 10px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; background: #007bff; color: white; font-weight: bold; }
                .btn-green { background: #28a745; }
                .btn-red { background: #dc3545; }
            </style>
        </head>
        <body>
            <h1>Roblox Command Center</h1>
            <div class="section">
                <h3>Target Selection</h3>
                <input type="text" id="targetUser" placeholder="Username (Required for targeted commands)">
            </div>
            <div class="section">
                <h3>Actions</h3>
                <button onclick="sendCommand('Kill')">Kill</button>
                <button onclick="sendCommand('Freeze')">Freeze</button>
                <button onclick="sendCommand('Thaw')">Unfreeze</button>
                <button class="btn-green" onclick="sendCommand('LoadWatermark')">Give Watermark</button>
                <button class="btn-red" onclick="sendCommand('Kick')">Kick</button>
            </div>
            <div class="section">
                <h3>Custom Lua Executor</h3>
                <textarea id="luaCode" placeholder="print('Running from web!')"></textarea>
                <button class="btn-green" onclick="sendLua()">Execute Script</button>
            </div>
            <script>
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

app.post('/send-command', (req, res) => {
    const { cmd, key, target, script } = req.body;
    if (key === SECRET_KEY) {
        pendingCommand = { command: cmd, target, script };
        res.json({ success: true });
    } else {
        res.status(403).send("Forbidden");
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

app.listen(PORT, '0.0.0.0', () => console.log("Web Panel Ready"));
