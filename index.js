const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.text());

let remoteScript = ""; 

// 1. Endpoint for YOU to set the script (use an API tester like Postman)
app.post('/set-script', (req, res) => {
    remoteScript = req.body;
    console.log("New script received: ", remoteScript);
    res.send("Script stored successfully.");
});

// 2. Endpoint for ROBLOX to fetch the script
app.get('/get-script', (req, res) => {
    res.send(remoteScript);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
