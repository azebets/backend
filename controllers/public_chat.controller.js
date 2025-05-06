const ChatModel = require('../models/chat.model');

class Chat {
    constructor(io) {
        this.io = io;
        this.activeUsers = new Set(); // Track active users by socket ID

        // Listen for client connections
        this.io.on('connection', async (socket) => {
            // console.log('A user connected:', socket.id);
            this.activeUsers.add(socket.id); // Add the connected user
            this.emitActiveUsers(); // Emit the updated active user count

            // Send the last 100 messages to the newly connected client
            const recentMessages = await ChatModel.find()
                .sort({ createdAt: -1 })
                .limit(100)
                .lean();
            socket.emit('load_previous_messages', recentMessages.reverse());

            // Listen for incoming messages
            socket.on('send_message', async (data) => {
                console.log('Message received:', data);

                // Save the message to the database
                const newMessage = new ChatModel(data);
                await newMessage.save();

                // Broadcast the message to all connected clients
                this.io.emit('receive_message', data);
            });

            // Handle user disconnect
            socket.on('disconnect', () => {
                console.log('A user disconnected:', socket.id);
                this.activeUsers.delete(socket.id); // Remove the disconnected user
                this.emitActiveUsers(); // Emit the updated active user count
            });
        });
    }

    // Emit the active user count to all connected clients
    emitActiveUsers() {
        this.io.emit('active_users', this.activeUsers.size);
    }
}

module.exports = Chat;