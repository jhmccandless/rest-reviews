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

app.get("/restaurant/new", (req, res) => {
  res.render("new-rest");
});

app.post("/restaurant/new", (req, res) => {
  let restInfo = req.body;
  db.none(
    `INSERT INTO restaurant (name, address, category) VALUES ('${restInfo.newRestName}', '${restInfo.newRestAddress}', '${restInfo.newRestCat}')`
  );
  res.redirect(`/restaurant/new-submit`);
});

app.get("/restaurant/new-submit", async (req, res, next) => {
  const newRestReady = await db.any(
    `SELECT * FROM restaurant ORDER BY ID DESC LIMIT 1`
  );
  let id = parseInt(newRestReady[0].id);
  res.redirect(`/restaurant/${id}`);
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

  /*
  // tyring to use the next(err), not really working well
    try {
    const results = await db.any(
      `SELECT * FROM restaurant WHERE name ILIKE '%${term}%'`
    );
    // console.log(results);
    if (results[0]) {
      res.render("search_results", { locals: { results } });
    } else {
      res.send({
        mes: "this is a ptentnial error",
      });
    }
  } catch (error) {
    // res.send(error);
    next(error);
  }
  // console.log(req.body);
  // res.redirect("/restaurant/new");
  // res.send("this is else statment");
  // next(err);

  // throw new Error("message for error");
});
*/
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
  db.none(
    `INSERT INTO review (title, review, stars, restaurant_id) VALUES ('${reviewInfo.reviewTitle}',  '${reviewInfo.review}', ${reviewInfo.reviewStars}, ${id})`
  );

  res.redirect(`/restaurant/${id}`);
});

const PORT = process.env.PORT || 3785;

server.listen(PORT, () => {
  console.log(`listening on: ${PORT}`);
});
