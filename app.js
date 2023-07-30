//jshint esversion:6
// level 1 security using username and password
// the code is only for reference purpose
// to use this code you need to install all the dependencies
// to use this code write the code in this format
// code order is important
require("dotenv").config(); // to use dotenv
const express = require("express"); // to use express
const bodyParser = require("body-parser"); // to use body parser
const mongoose = require("mongoose"); // to use mongoose
const ejs = require("ejs"); // to use ejs
const session = require("express-session"); // to use session
const passport = require("passport"); // to use passport
const passportLocalMongoose = require("passport-local-mongoose"); // to use passport local mongoose
const app = express(); // to use express
const port = process.env.PORT || 3000; // to use heroku port or local port
app.use(bodyParser.urlencoded({ extended: true })); // to use body parser
app.use(express.static("public")); // to use static files like css, images, etc
app.set("view engine", "ejs"); // to use ejs
app.use(
  session({
    secret: "Our little secret.", // to use session
    resave: false, // to use session// to save session
    saveUninitialized: false, // to use session// to save session
  }) // to use session
);
app.use(passport.initialize()); // to use passport// to initialize passport
app.use(passport.session()); // to use passport// to use passport session
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
  useNewUrlParser: true, // to remove deprecation warning// to use bodyParser
}); // to connect to mongodb
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
}); // to create schema
userSchema.plugin(passportLocalMongoose); // to use passport local mongoose// to hash and salt password and save it in mongodb
const User = new mongoose.model("User", userSchema); // to create model
passport.use(User.createStrategy()); // to use passport local mongoose// create strategy
passport.serializeUser(User.serializeUser()); // to use passport local mongoose// create cookie
passport.deserializeUser(User.deserializeUser()); // to use passport local mongoose// destroy cookie
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
// secrets route
app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    // to use passport local mongoose// to check if user is authenticated
    res.render("secrets.ejs");
  } else {
    res.redirect("/login");
  }
});
// post route for register
app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username }, // to use passport local mongoose// to register user
    req.body.password, // to use passport local mongoose// to register user
    function (err, user) {
      // to use passport local mongoose// to register user
      if (err) {
        console.log(err); // to use passport local mongoose// to register user
        res.redirect("/register"); // to use passport local mongoose// to register user
      } else {
        passport.authenticate("local")(req, res, function () {
          // to use passport local mongoose// to register user
          res.redirect("/secrets"); // to use passport local mongoose// to register user
        });
      }
    }
  );
});
// post route for login
app.post("/login", function (req, res) {
  const user = new User({
    // to use passport local mongoose// to login user
    username: req.body.username, // to use passport local mongoose// to login user
    password: req.body.password, // to use passport local mongoose// to login user
  });
  req.login(user, function (err) {
    // to use passport local mongoose// to login user
    if (err) {
      console.log(err); // to use passport local mongoose// to login user
    } else {
      passport.authenticate("local")(req, res, function () {
        // to use passport local mongoose// to login user
        res.redirect("/secrets"); // to use passport local mongoose// to login user
      });
    }
  });
});
// post route for logout
app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err); // Handle any potential error here
    }
    res.redirect("/"); // Redirect after successful logout
  });
});
app.listen(port, function () {
  // to listen on port
  console.log(`Server started on port ${port}`);
  console.log(`http://localhost:${port}`);
});
