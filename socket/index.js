const { Server } = require("socket.io");
const DiceGame = require("../model/dice_game");  
const PubicChats = require("../controllers/Chat");
const { CrashGameEngine } = require("../controllers/crashControllers");
const { handleHiloBet,
  handleHiloNextRound,
  handleHiloCashout,
  initHiloGame,
} = require("../controllers/hiloController");

async function createsocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["https://azebets.com", "http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  
  // Crash Game
  new CrashGameEngine(io)
    .run((latestBet) => {
      io.emit("latest-bet", latestBet);
    })
    .catch((err) => {
      console.log("Crash Game failed to start ::> ", err);
    });

  new PubicChats(io)
    .getChatsfromDB((newMessage) => {
      io.emit("new-message", newMessage);
    })
    .catch((err) => {
      console.log("Chat failed to start ::> ", err);
    });



  let fghhs = await DiceGame.find().limit(20)
  let activeplayers = [...fghhs];
  const DiceActivePlayers = async (e) => {
    if (activeplayers.length > 21) {
      activeplayers.shift();
      activeplayers.push(e);
    } else {
      activeplayers.push(e);
    }
    io.emit("dice-gamePLayers", activeplayers);
  };

  io.on("connection", (socket) => {
    socket.on("dice-game", (data) => {
      DiceActivePlayers(data);
    });

     //HILO GAME
    socket.on("hilo-init", (data) => {
      initHiloGame(data, (event, payload) => {
        io.emit(event, payload);
      });
    });
    socket.on("hilo-bet", (data) => {
      handleHiloBet(data, (event, payload) => {
        io.emit(event, payload);
      });
    });
    socket.on("hilo-cashout", (data) => {
      handleHiloCashout(data, (event, payload) => {
        io.emit(event, payload);
      });
    });
    socket.on("hilo-next-round", (data) => {
      handleHiloNextRound(data, (event, payload) => {
        io.emit(event, payload);
      });
    });

  });
}

module.exports = { createsocket }
