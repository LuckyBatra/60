const express = require("express");
const User = require("../Models/user");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../Controller/user.js");

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post( saveRedirectUrl, // Middleware to prepare redirectUrl
    passport.authenticate("local", {
      failureRedirect: "/login", // Redirect to login on failure
      failureFlash: true,        // Flash failure message
    }),
    userController.login
  );
  
router.get("/logout", userController.logout);

    module.exports = router;