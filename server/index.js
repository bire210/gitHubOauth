
const express = require("express");
const GitHubStrategy = require("passport-github").Strategy;
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();
const app = express();

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  cb(null, id);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: process.env.callbackURL,
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile)
      cb(null, profile);
    }
  )
);

const isAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuth, (req, res) => {
   
  res.sendFile(__dirname + "/dashboard.html");
});

app.get("/login", (req, res) => {
  if (req.user) {
    console.log(req.user)
    return res.redirect("/");
  }
  res.sendFile(__dirname + "/login.html");
});

app.get("/logout", (req, res) => {
  req.logOut();
  req.session.destroy();
  res.redirect("/login");
});

//auth
app.get("/auth/github", passport.authenticate("github"));

app.get("/api/oauth/github",passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.listen(4000, () => console.log("server is running on port 4000"));
