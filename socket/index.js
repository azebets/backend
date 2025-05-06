const { Server } = require("socket.io");
const Chat = require("../controllers/public_chat.controller.js")

async function createsocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["https://azebets.com","http://localhost:5173" ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  const chat = new Chat(io)

  io.on("connection", (socket) => {
 
  });
}

module.exports = { createsocket }
