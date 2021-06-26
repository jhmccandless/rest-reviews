"use strict";

const http = require("http");
const express = require("express");
const es6Renderer = require("express-es6-template-engine");
const exp = require("constants");
const pgp = require("pg-promise")({});
const dbsettings = process.env.DATABASE_URL || { database: "jasonmccandless" };
const db = pgp(dbsettings);

const app = express();
const server = http.createServer(app);
app.engine("html", es6Renderer);
app.set("views", "templates");
app.set("view engine", "html");

app.use("/public", express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/restaurant/new", (req, res) => {
  res.render("new-rest");
});

app.get("/search", async (req, res, next) => {
  let term = req.query.searchPhrase;
  const results = await db.any(
    `SELECT * FROM restaurant WHERE name ILIKE '%${term}%'`
  );
  if (results[0]) {
    res.render("search_results", { locals: { results } });
  } else {
    res.redirect("/restaurant/new");
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
    ORDER BY review.id DESC`
  );
  res.render("restaurant", {
    locals: { restInfo, restReviews },
  });
});

app.post("/restaurant/:id", (req, res, next) => {
  let reviewInfo = req.body;
  let id = parseInt(req.params.id);
  //   db.none(
  //     `INSERT INTO review (title, review, stars, restaurant_id) VALUES ('${reviewInfo.reviewTitle}',  '${reviewInfo.review}', ${reviewInfo.reviewStars}, ${id})`
  //   );

  res.redirect(`/restaurant/${id}`);
});

const PORT = process.env.PORT || 3785;

server.listen(PORT, () => {
  console.log(`listening on: ${PORT}`);
});
