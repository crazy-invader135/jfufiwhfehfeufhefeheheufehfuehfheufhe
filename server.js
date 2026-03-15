const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CONFIGURATION: Set your secret and whitelisted user here
const SECRET_KEY = "MySuperSecret123"; 
const WHITELISTED_USER = "YourRobloxUsername"; // Change this to your name

let pendingCommand = null;

app.get('/', (req, res) => {
    res.send(`
        <h1>Whitelisted Admin Panel</h1>
        <p>Logged in as: <b>${WHITELISTED_USER}</b></p>
        <button onclick="sendCommand('KillAll')">Kill All Players</button>
        <button onclick="sendCommand('DayTime')">Set Day Time</button>

        <script>
            function sendCommand(cmd) {
                fetch('/send-command', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        cmd: cmd,
                        key: "${SECRET_KEY}",
                        user: "${WHITELISTED_USER}"
                    })
                }).then(() => alert('Command Sent!'));
            }
        </script>
    `);
});

app.post('/send-command', (req, res) => {
    const { cmd, key, user } = req.body;

    // Check if the key and the user match our whitelist
    if (key === SECRET_KEY && user === WHITELISTED_USER) {
        pendingCommand = { command: cmd, sender: user };
        console.log(`Verified command [${cmd}] from ${user}`);
        res.json({ success: true });
    } else {
        console.warn("Unauthorized attempt to send command!");
        res.status(403).json({ success: false, error: "Unauthorized" });
    }
});

app.get('/get-commands', (req, res) => {
    if (pendingCommand) {
        res.json(pendingCommand);
        pendingCommand = nil; // Use null in JS; cleared after Roblox picks it up
        pendingCommand = null; 
    } else {
        res.json({ command: "none" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Secure Server running on port ${PORT}`);
});
