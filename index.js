"use strict";

const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
// const { execPath } = require("process");
const es6Renderer = require("express-es6-template-engine");
const pgp = require("pg-promise")({});
const db = pgp({ database: "jasonmccandless" });

const app = express();
const server = http.createServer(app);
app.engine("html", es6Renderer);
app.set("views", "templates");
app.set("view engine", "html");

const hostname = "127.0.0.1";
const port = 3785;

app.use("/public", express.static("public"));
app.use(bodyParser.urlencoded());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/search/", async (req, res) => {
  const info = await db.query("SELECT * FROM review");
  res.render("search_results");
});

server.listen(port, hostname, () => {
  console.log(`listening on ${hostname}: ${port}`);
});
