const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const SECRET_KEY = "MySuperSecret123"; 
let pendingCommand = null;

app.get('/', (req, res) => {
    res.send(`
        <style>
            body { font-family: sans-serif; padding: 20px; background: #f0f2f5; }
            .section { background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            button { margin: 5px; padding: 8px 12px; cursor: pointer; border: none; border-radius: 4px; background: #007bff; color: white; }
            button:hover { background: #0056b3; }
            input { padding: 8px; width: 200px; border: 1px solid #ccc; border-radius: 4px; }
            .danger { background: #dc3545; }
            .danger:hover { background: #a71d2a; }
        </style>

        <h1>Roblox Remote Command Center</h1>
        
        <div class="section">
            <label>Target Player:</label>
            <input type="text" id="targetUser" placeholder="Username...">
        </div>

        <div class="section">
            <h3>Utility Commands</h3>
            <button onclick="sendCommand('Kill')">Kill</button>
            <button onclick="sendCommand('Freeze')">Freeze</button>
            <button onclick="sendCommand('Thaw')">Unfreeze</button>
            <button onclick="sendCommand('Heal')">Heal</button>
        </div>

        <div class="section">
            <h3>Fun Commands</h3>
            <button onclick="sendCommand('Fire')">Set on Fire</button>
            <button onclick="sendCommand('Sparkles')">Add Sparkles</button>
            <button onclick="sendCommand('BigHead')">Big Head</button>
            <button onclick="sendCommand('NormalHead')">Normal Head</button>
        </div>

        <div class="section">
            <h3>Server Controls</h3>
            <button onclick="sendCommand('DayTime')">Set Noon</button>
            <button onclick="sendCommand('NightTime')">Set Night</button>
            <button onclick="sendCommand('Announcement')">Send "Hello!"</button>
            <button class="danger" onclick="sendCommand('Kick')">Kick Player</button>
        </div>

        <script>
            function sendCommand(cmd) {
                const username = document.getElementById('targetUser').value;
                fetch('/send-command', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ cmd: cmd, key: "${SECRET_KEY}", target: username })
                }).then(() => console.log('Sent:', cmd));
            }
        </script>
    `);
});

app.post('/send-command', (req, res) => {
    const { cmd, key, target } = req.body;
    if (key === SECRET_KEY) {
        pendingCommand = { command: cmd, target: target };
        res.json({ success: true });
    } else {
        res.status(403).send("Wrong Key");
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

app.listen(PORT, '0.0.0.0', () => console.log("Panel Live!"));
