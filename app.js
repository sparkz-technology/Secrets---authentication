//jshint esversion:6
// level 1 security using username and password only
const express = require("express"); // to use express
const bodyParser = require("body-parser"); // to use body parser
const mongoose = require("mongoose"); // to use mongoose
const ejs = require("ejs"); // to use ejs
const app = express(); // to use express
const port = process.env.PORT || 3000; // to use heroku port or local port
app.use(bodyParser.urlencoded({ extended: true })); // to use body parser
app.use(express.static("public")); // to use static files like css, images, etc
app.set("view engine", "ejs"); // to use ejs
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
  useNewUrlParser: true,
}); // to connect to mongodb
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
}); // to create schema
const User = new mongoose.model("User", userSchema); // to create model
// Home route
app.get("/", function (req, res) {
  res.render("home.ejs");
});
// login route
app.get("/login", function (req, res) {
  res.render("login.ejs");
});
// register route
app.get("/register", function (req, res) {
  res.render("register.ejs");
});
// post route for register
app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  try {
    newUser.save();
    res.render("secrets.ejs");
    console.log("User Registered successfully");
  } catch (err) {
    console.log(err);
  }
});
// post route for login
app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  try {
    User.findOne({ email: username }).then(function (foundUser) {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets.ejs");
          console.log("User Logged in successfully");
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
});
app.listen(port, function () {
  // to listen on port
  console.log(`Server started on port ${port}`);
  console.log(`http://localhost:${port}`);
});
