const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");

const config = require("./config");
const app = express();

const UserModel = require("./model-mvc");

const initializePassport = require("./passport-config");
initializePassport(passport);

const port = config.PORT;
const mongoURI = config.mongoURI;

const fileUpload = require("express-fileupload");
app.use(fileUpload());
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
// app.use(morgan("dev"));
app.use(flash());
app.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: false,
    resave: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));

// Routes
app.get("/", checkAuthenticated, (req, res) => {
  const { name, biography, dpURL } = req.user;
  res.render("index.ejs", { name, biography, dpURL });
});

app.get("/edit", checkAuthenticated, (req, res) => {
  const { name, biography, dpURL } = req.user;
  res.render("edit.ejs", { name, biography, dpURL });
});

const { editProfile } = require("./editProfile.aws");
app.post("/editProfile", checkAuthenticated, editProfile);

// app.post("/editProfile", checkAuthenticated, (req, res) => {
//   console.log(req);
//   const { name, biography } = req.body;
//   const userId = req.user._id;
//   console.log(req);

//   // Write here the AWS Code
//   const { dpURL } = req.user;

//   UserModel.findByIdAndUpdate(
//     userId,
//     {
//       name,
//       biography,
//       dpURL,
//     },
//     { new: true }
//   )
//     .then((newUserData) => {
//       newUserData = newUserData.toObject();
//       delete newUserData.password;
//       req.user = newUserData;
//       res.redirect("/login");
//     })
//     .catch((error) => res.status(401).json(error));
// });

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post("/index", (req, res) => {
  console.log(req);
  req.logOut();
  res.redirect("/login");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, (req, res) => {
  const { name, email, password } = req.body;
  // console.log(req);
  if (!email || !password || !name) {
    return res
      .status(422)
      .json({ error: "You must provide name, email and password" });
  }

  UserModel.findOne({ email }, function (err, existingUser) {
    if (err) return res.status(422).json(err);
    if (existingUser) {
      return res.status(422).json({
        error: "Arlready account is there with this email",
      });
    }

    const user = new UserModel({ name, email, password });

    user.save(function (err, savedUser) {
      if (err) {
        return next(err);
      }
      console.log("----------Signup Success--------");
      console.log(savedUser);
      res.redirect("/login");
    });
  });
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

// Server Listen
app.listen(port, (error) => {
  if (error) {
    console.log("Something went wrong");
  } else {
    console.log(`Server is listening on port ${port}`);
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch((err) => console.error(err));

module.exports = app;
