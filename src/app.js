const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const errorHandler = require("./middleware/errorHandler");
const contractRouter = require("./routes/contracts");
const jobRouter = require("./routes/jobs");
const balanceRouter = require("./routes/balances");
const adminRouter = require("./routes/admin");

//App setup
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

//Routes
app.use("/contracts", contractRouter);
app.use("/jobs", jobRouter);
app.use("/balances", balanceRouter);
app.use("/admin", adminRouter);

//Middleware
app.use(errorHandler);

module.exports = app;
