"use strict";

const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const { execPath } = require("process");

const app = express();
const server = http.createServer(app);

const hostname = "127.0.0.1";
const port = 3785;

///// app logic

app.get("/", (req, res) => {
  res.send(console.log("working"));
});
app.use(express.static("public"));
app.use(bodyParser.urlencoded());

server.listen(port, hostname, () => {
  console.log(`listening on ${hostname}: ${port}`);
});
