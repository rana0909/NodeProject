var express = require("express");
var mongoose = require("mongoose");
var url = require("url");
var app = express();
var { param, validationResult } = require("express-validator");
var database = require("./config/database");
var bodyParser = require("body-parser");
var path = require("path");
var bcrypt = require("bcryptjs");
var exphbs = require("express-handlebars");

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(express.static(path.join(__dirname, "public")));
app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

mongoose.connect(database.url);

var Restaurants = require("./models/restaurant");

//basic route
app.get("/", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let { username, password } = req.body;
  const creds = process.env.PASS;

  bcrypt
    .compare(password, creds)
    .then((result) => {
      console.log(result);
      console.log(password);
      if (result === true) {
        console.log("Password Matched. Login Success!");
        res.render("home");
      } else {
        console.log("Login Failed!");
        res.render("login");
      }
    })
    .catch((err) => console.log(err));
});

// get the restaurants by UI form
app.get("/api/restaurants/pages", (req, res) => {
  res.render("getPageAndPerPageInput");
});

// display restaurants in UI
app.post("/api/restaurants/pages", async (req, res) => {
  // let { page, perPage, borough } = req.body ;
  let page = req.body.page || 1;
  let perPage = req.body.perPage || 5;
  let borough = req.body.borough || "";

  let matchQuery = {};
  if (borough) {
    matchQuery[borough] = borough;
  }
  const restaurants = await Restaurants.find(matchQuery)
    .lean()
    .sort({ _id: 1 })
    .limit(page * perPage);

  const restaurantsToDisplay = restaurants.splice((page - 1) * perPage);
  console.log(restaurantsToDisplay);
  res.render("displayRestaurants", { data: restaurantsToDisplay });
});

// get the restaurant by pageNumber,PerPageCount, borough filter
app.get("/api/restaurants", async (req, res) => {
  const queryParams = url.parse(req.url, true).query;
  let page = queryParams.page || 1;
  let perPage = queryParams.perPage || 5;

  const restaurants = await Restaurants.find({})
    .sort({ _id: 1 })
    .limit(page * perPage);

  res.send(restaurants.splice((page - 1) * perPage));
});

// get the restaurant by id
app.get("/api/restaurants/:restaurant_id", function (req, res) {
  let id = req.params.restaurant_id;
  Restaurants.findById(id, function (err, restaurant) {
    if (err) res.send(err);

    res.json(restaurant);
  });
});

// insert a restaurant
app.post("/api/restaurants", function (req, res) {
  console.log(req.body);
  Restaurants.create(
    {
      restaurant_id: req.body.restaurant_id,
      name: req.body.name,
      borough: req.body.borough,
      cuisine: req.body.cuisine,
    },
    function (err, restaurant) {
      if (err) res.send(err);

      Restaurants.find({ restaurant_id: req.body.restaurant_id }).exec(
        function (err, restaurant) {
          res.send(restaurant);
        }
      );
    }
  );
});

// update a restaurant
app.put("/api/restaurants/:_id", (req, res) => {
  let _id = req.params._id;
  let data = {
    restaurant_id: req.body.restaurant_id,
    name: req.body.name,
    cuisine: req.body.cuisine,
    borough: req.body.borough,
  };
  Restaurants.findByIdAndUpdate(_id, data, (err, restaurant) => {
    if (err) throw err;

    res.send("Updated Successfully!");
  });
});

// delete a restaurant
app.delete("/api/restaurants/:_id", (req, res) => {
  let _id = req.params._id;
  Restaurants.deleteOne({ _id }, (err) => {
    if (err) throw err;

    res.send("Deleted Successfully!");
  });
});

app.listen(port);
console.log("App listening on port : " + port);
