const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const SECRET_KEY = "MySuperSecret123"; 
let pendingCommand = null;

// The Website Interface
app.get('/', (req, res) => {
    res.send(`
        <h1>Roblox Admin Panel</h1>
        
        <label for="targetUser">Target Player Username:</label><br>
        <input type="text" id="targetUser" placeholder="Username here..." style="margin-bottom: 10px;"><br>

        <button onclick="sendCommand('Kill')">Kill Target</button>
        <button onclick="sendCommand('Kick')">Kick Target</button>
        <button onclick="sendCommand('DayTime')">Global: Set Day</button>

        <script>
            function sendCommand(cmd) {
                const username = document.getElementById('targetUser').value;
                
                fetch('/send-command', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        cmd: cmd,
                        key: "${SECRET_KEY}",
                        target: username // Sending the name from the text box
                    })
                }).then(response => {
                    if(response.ok) alert('Command "' + cmd + '" sent for: ' + (username || "Server"));
                });
            }
        </script>
    `);
});

app.post('/send-command', (req, res) => {
    const { cmd, key, target } = req.body;

    if (key === SECRET_KEY) {
        // We now store the specific target player with the command
        pendingCommand = { command: cmd, target: target };
        console.log(`Command [${cmd}] queued for target: ${target}`);
        res.json({ success: true });
    } else {
        res.status(403).json({ success: false });
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
