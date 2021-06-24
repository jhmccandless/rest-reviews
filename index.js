"use strict";

const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const { execPath } = require("process");
const es6Renderer = require("express-es6-template-engine");

const app = express();
const server = http.createServer(app);
app.engine("html", es6Renderer);
app.set("views", "views");
app.set("view engine", "html");
app.use(express.static("public"));

const hostname = "127.0.0.1";
const port = 3785;
///// app logic

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.render("home");
});

app.use(bodyParser.urlencoded());

server.listen(port, hostname, () => {
  console.log(`listening on ${hostname}: ${port}`);
});
