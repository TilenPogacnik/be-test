const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const errorHandler = require("./middleware/errorHandler");
const contractRouter = require("./routes/contracts");
const jobRouter = require("./routes/jobs");

//App setup
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

//Routes
app.use("/contracts", contractRouter);
app.use("/jobs", jobRouter);

//Middleware
app.use(errorHandler);

module.exports = app;
