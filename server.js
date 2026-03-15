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
                textarea { width: 90%; height: 150px; background: #000; border: 1px solid #444; color: #00ff00; font-family: monospace; padding: 10px; }
                button { padding: 12px 20px; margin: 5px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; background: #007bff; color: white; }
                .btn-green { background: #28a745; }
            </style>
        </head>
        <body>
            <h1>Roblox Remote Console</h1>
            
            <div class="section">
                <h3>Whitelist User</h3>
                <input type="text" id="selfName" placeholder="Username..." style="padding:10px;">
                <button class="btn-green" onclick="joinWhitelist()">Add User</button>
            </div>

            <div class="section">
                <h3>Custom Lua Executor</h3>
                <textarea id="luaCode" placeholder="print('Remote script works!')"></textarea><br>
                <button onclick="sendLua()">Execute Script</button>
            </div>

            <script>
                async function joinWhitelist() {
                    const user = document.getElementById('selfName').value;
                    await fetch('/add-whitelist', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ user })
                    });
                    alert("Whitelisted: " + user);
                }

                async function sendLua() {
                    const code = document.getElementById('luaCode').value;
                    await fetch('/send-command', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ 
                            cmd: 'CustomScript', 
                            key: "${SECRET_KEY}", 
                            lua: code 
                        })
                    });
                    alert("Script Sent!");
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
    const { cmd, key, lua } = req.body;
    if (key === SECRET_KEY) {
        pendingCommand = { command: cmd, lua: lua };
        res.json({ success: true });
    } else {
        res.status(403).send("Forbidden");
    }
});

app.get('/get-commands', (req, res) => {
    res.json({
        commandData: pendingCommand || { command: "none" },
        whitelist: whitelistedUsers
    });
    pendingCommand = null; 
});

app.listen(PORT, '0.0.0.0', () => console.log("Server Live"));
