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
const jwt = require("jsonwebtoken"); // to use jsonwebtoken
const app = express(); // to use express
const bcrypt = require("bcrypt"); // to use bcrypt
const cookieParser = require("cookie-parser"); // to use cookie parser
const { use } = require("passport");
const port = process.env.PORT || 3000; // to use heroku port or local port
app.use(cookieParser()); // to use cookie parser
app.use(bodyParser.urlencoded({ extended: true })); // to use body parser
app.use(express.static("public")); // to use static files like css, images, etc
app.set("view engine", "ejs"); // to use ejs

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
  useNewUrlParser: true, // to remove deprecation warning// to use bodyParser
}); // to connect to mongodb
// Function to generate JWT token
function generateToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" }); // Token expires in 1 hour
}

const authenticateToken = (req, res, next) => {
  //   console.log("Cookies:", req.cookies);
  const token = req.cookies.token;
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.sendStatus(403);
    }
    console.log("Decoded user from token:", user);
    req.user = user;
    next();
  });
};

// app.use(authenticateToken); // to use jwt// to authenticate token
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
// secrets route
app.get("/secrets", authenticateToken, function (req, res) {
  // The user object from JWT is accessible in req.user due to the authenticateToken middleware
  res.render("secrets.ejs");
});

// post route for register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: username,
      password: hashedPassword,
    });

    await newUser.save();
    // to use jwt
    const user = { username };
    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/secrets");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});
// post route for login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const foundUser = await User.findOne({ email: username });
    if (!foundUser) {
      return res.status(404).send("User not found");
    }
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) {
      return res.status(401).send("Incorrect password");
    }
    // Set the Authorization header
    const token = generateToken({ email: foundUser.email });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/secrets");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// Mount the Router object on the express app
// post route for logout
app.get("/logout", function (req, res) {
  res.clearCookie("token");
  res.redirect("/");
});
app.listen(port, function () {
  // to listen on port
  console.log(`Server started on port ${port}`);
  console.log(`http://localhost:${port}`);
});
