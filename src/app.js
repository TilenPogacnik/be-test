const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const errorHandler = require("./middleware/errorHandler");

//App setup
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

//Routes
app.use("/contracts", require("./routes/contracts"));

//Middleware
app.use(errorHandler);

module.exports = app;
