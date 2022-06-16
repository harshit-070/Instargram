const express = require("express");
const routes = require("../routes");
const cookieParser = require("cookie-parser");
const path = require("path");

function createServer() {
  const app = express();

  require("dotenv").config({
    path: path.join(__dirname, "../config/config.env"),
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/public", express.static("public"));

  routes(app);

  return app;
}

module.exports = createServer;
