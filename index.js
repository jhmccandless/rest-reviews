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
// app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/search", async (req, res) => {
  let term = req.query.searchPhrase;
  const info = await db.any(
    `SELECT * FROM restaurant WHERE name ILIKE '%${term}%'`
  );
  res.render("search_results", { locals: { info } });
});

app.get("/restraunt/:id", (req, res, next) => {
  let id = req.params.id;
  console.log(id);
  db.any(
    `
      select
        reviewer.name as reviewer_name,
        review.title,
        review.stars,
        review.review
      from
        restaurant
      inner join
        review on review.restaurant_id = restaurant.id
      inner join
        reviewer on review.reviewer_id = reviewer.id
      where restaurant.id = ${id}
    `
  )
    .then(function (reviews) {
      return [
        reviews,
        db.one(`
            select name as restaurant_name, * from restaurant
            where id = ${id}`),
      ];
    })
    .spread(function (reviews, restaurant) {
      resp.render("restaurant.hbs", {
        restaurant: restaurant,
        reviews: reviews,
      });
    })
    .catch(next);
});

server.listen(port, hostname, () => {
  console.log(`listening on ${hostname}: ${port}`);
});
