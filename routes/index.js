var express = require('express');
var router  = express.Router();
var User    = require('../models/user');
var passport= require('passport');

// Root route
router.get('/', (req, res) => {
    res.render("landing");
})

// Register form route
router.get('/register', (req, res)=>{
    res.render("register");
})
// Handle sign up logic
router.post('/register', (req, res)=>{
    var newUser = new User({username : req.body.username});
    User.register(newUser, req.body.password, (err, user)=>{
        if (err){
            console.log('The error: ', err.message);
            // Instead of explicily writing every possible error during the registration
            // we can just pass in err from passport to flash:
            // req.flash("error", err);
            return res.render('register',  {"error" : err.message});
        }
        passport.authenticate("local")(req, res, ()=>{
            req.flash("success", "Welcome to YelpCamp " + user.username)
            res.redirect('/campgrounds');
        });
    });
});
// Show login form
router.get('/login', (req, res)=>{
    res.render('login');
})
// Handle login logic
router.post('/login', passport.authenticate("local", {
    successRedirect : "/campgrounds",
    successMessage  : "Good job",
    failureRedirect : "/login"
}),(req, res)=>{
})
// Logout route
router.get('/logout',(req, res)=>{
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect('/campgrounds');
})

module.exports = router;
