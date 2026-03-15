const express = require('express');
const app = express();

// Use the port Render gives us, or default to 3000 for local testing
const PORT = process.env.PORT || 3000;

// Middleware to let the server read JSON data from Roblox
app.use(express.json());

// 1. Home Page (What you see when you visit the URL in a browser)
app.get('/', (req, res) => {
    res.send('<h1>Roblox Bridge is Online!</h1><p>Waiting for data from the game...</p>');
});

// 2. The Data Endpoint (Where the Roblox script sends information)
app.post('/roblox-data', (req, res) => {
    const data = req.body;

    console.log("--- New Data from Roblox ---");
    console.log("Server Message:", data.message);
    console.log("Player Count:", data.playerCount);
    console.log("----------------------------");

    // This response goes back to your Roblox Output window
    res.status(200).json({
        success: true,
        status: "Received!",
        serverTime: new Date().toLocaleTimeString()
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
