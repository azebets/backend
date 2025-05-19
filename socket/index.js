const { Server } = require("socket.io");
const Chat = require("../controllers/public_chat.controller.js");
// const { CrashGameEngine } = require("../controllers/games/crash.controller.js");
const { CrashGameEngine } = require('../controllers/games/crash');
const { initMinesGame } = require('../controllers/games/mines');

async function createsocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["https://azebets.com", "http://localhost:5173", "https://azebets.netlify.app"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  
  // Initialize chat controller
  const chat = new Chat(io);
  
  // // Initialize crash game manager with the main io instance
  // const crashGame = new CrashGameEngine(io).run();
  // Initialize the crash game
const crashGame = new CrashGameEngine(io);
crashGame.run((bet) => {
  // Handle bet callback if needed
  io.emit('new-bet', bet);
});
const minesGameEngine = initMinesGame(io);
global.gameEngines = {
  mines: minesGameEngine,
  // other games...
};

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

module.exports = { createsocket };
