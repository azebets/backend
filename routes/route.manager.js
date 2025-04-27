const authRoute = require('./auth.route');
const gameRoute = require('./api/game.route');
const profileRoute = require('./api/profile.route');
const ccpaymentRoute = require('./api/ccpayment.route');
const hiloGame = require("./api/hilo.routes")
const CrashGame = require("./api/crashgame.route");

const routeManager = (app) => {

    // API Routes
    app.use("/auth", authRoute);
    app.use('/api/games', gameRoute);
    app.use("/api/profile", profileRoute);
    app.use("/api/payment/ccpayment", ccpaymentRoute);
    app.use("/api/ccpayment", ccpaymentRoute);
    app.use("/api/hilo-game", hiloGame)
    app.use("/api/user/crash-game", CrashGame);
}

module.exports = routeManager