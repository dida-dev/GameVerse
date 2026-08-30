const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = 3000;

// Serve all your HTML/CSS files from your current folder automatically
app.use(express.static(__dirname));

// Route mapping for easy dashboard transitions
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/chat.html', (req, res) => res.sendFile(path.join(__dirname, 'chat.html')));

// Handle websocket connections from real users
io.on('connection', (socket) => {
    console.log('A user connected to the workspace.');

    // When a user sends a message, broadcast it to EVERYONE connected
    socket.on('chatMessage', (data) => {
        io.emit('messageBroadcast', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

// Fire up the server
http.listen(PORT, () => {
    console.log(`Server running smoothly! Open http://localhost:${PORT} in multiple tabs to chat.`);
});