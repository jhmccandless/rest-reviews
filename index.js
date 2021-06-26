"use strict";

const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
// const { execPath } = require("process");
const es6Renderer = require("express-es6-template-engine");
const pgp = require("pg-promise")({});
const dbsettings = process.env.DATABASE_URL || { database: "jasonmccandless" };
const db = pgp(dbsettings);

const app = express();
const server = http.createServer(app);
app.engine("html", es6Renderer);
app.set("views", "templates");
app.set("view engine", "html");

app.use("/public", express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/search", async (req, res, next) => {
  let term = req.query.searchPhrase;
  const results = await db.any(
    `SELECT * FROM restaurant WHERE name ILIKE '%${term}%'`
  );
  if (results) {
    res.render("search_results", { locals: { results } });
  } else {
  }
});

app.get("/restaurant/:id", async (req, res, next) => {
  let id = parseInt(req.params.id);
  const restInfo = await db.one(
    `SELECT name, address, category FROM restaurant WHERE id = ${id}`
  );
  const restReviews = await db.any(
    `SELECT review.restaurant_id, review.title, review.stars, review.review, reviewer.name 
	FROM review 
    LEFT JOIN reviewer 
    ON reviewer.id = review.reviewer_id
    WHERE review.restaurant_id = ${id}
    ORDER BY reviewer.name`
  );
  res.render("restaurant", {
    locals: { restInfo, restReviews },
  });
});

app.post("/restaurant/:id", async (req, res, next) => {
  console.log(req.body);
  //   const reviewInfo = await
});

const HOST = "127.0.0.1";
const PORT = process.env.PORT || 3785;

server.listen(PORT, HOST, () => {
  console.log(`listening on ${HOST}: ${PORT}`);
});
