const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const routeManager = require('./routes/route.manager.js')
const { createsocket } = require("./socket/index.js");
const { createServer } = require("node:http");
const colors = require("colors");

require("dotenv").config();
// ============ Initilize the app ========================
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true , limit: '50mb'}));
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://azebets.com"],
    credentials: true
}));

const server = createServer(app);
async function main() {
    try {
        await createsocket(server);
        console.log('[Socket] WebSocket server initialized');
    } catch (error) {
        console.error('[Socket] Failed to initialize WebSocket server:', error);
    }
}

main().catch(console.error);

// application routes
routeManager(app)

app.get("/", (req, res) => {
  res.send(colors.green("Welcome to azebets backend server"));
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).json({
      status: false,
      code  : 500,
      error : `Can't find ${err.stack}`
  });
});

// 404 handler
app.use(function (req, res, next) {
  res.status(404).json({
      status: false,
      code  : 404,
      error : `Can't find ${req.originalUrl}`
  });
});

mongoose.set('strictQuery', false);
// const dbUri = "mongodb+srv://cyclixgamesdev:WR1gmj3ScmZZh6vV@cluster0.asnhbpn.mongodb.net/cygcasstest?retryWrites=true&w=majority&appName=Cluster0"
const dbUri = `mongodb+srv://highscoreteh:AoUXugCyZEfpBmMx@cluster0.xmpkpjc.mongodb.net/azebets?retryWrites=true&w=majority`
// const dbUri = `mongodb://127.0.0.1:27017/azebets`;
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000  })
  .then((result) => console.log('[Database] Database connected'))
  .catch((err) => console.log("[Database] Database failed to connect"))
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] WebSocket server available at ws://localhost:${PORT}`);
});
