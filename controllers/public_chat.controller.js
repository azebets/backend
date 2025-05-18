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
           

                try {
                    // Validate message data
                    if (!data.username || !data.content) {
                        console.error('Invalid message format:', data);
                        return;
                    }

                    // Create a message object with all required fields
                    const messageData = {
                        username: data.username,
                        content: data.content,
                        vipLevel: data.vipLevel || 0, // Store VIP level directly
                        timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
                    };
                    // Save the message to the database
                    const newMessage = new ChatModel(messageData);
                    await newMessage.save();
                    // Broadcast the message to all connected clients
                    this.io.emit('receive_message', messageData);
                } catch (error) {
                    console.error('Error saving message:', error);
                    // Optionally notify the sender that the message failed to save
                    socket.emit('message_error', { error: 'Failed to save message' });
                }
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