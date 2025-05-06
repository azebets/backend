const authRoute = require('./auth.route');
const userRoute = require("./api/user.route")
const ccpayment = require("./api/ccpayment.route")
// const adminRoute = require('./admin.route');

const routeManager = (app) => {
    // API Routes
    app.use("/auth", authRoute);
    app.use("/api/user", userRoute)
    app.use("/api/ccpayment", ccpayment)
    // app.use("/admin", adminRoute);

}

module.exports = routeManager
