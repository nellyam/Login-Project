const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.get("/", authController.isLoggedIn, (req, res) => {
    res.render("index", {
        user: req.user
    })
}); 

router.get("/register", (req, res) => {
    res.render("register")
}); 

router.get("/login", (req, res) => {
    res.render("login")
}); 

router.get("/profile", authController.isLoggedIn, (req, res) => {
    if(req.user) {
        res.render("profile", {
            name: req.user.name.slice(0, 1).toUpperCase() + req.user.name.slice(1),
            email: req.user.email
        }) 
    } else {
        res.redirect("/login");
    }
   
}); 

module.exports = router;