var express = require('express');
var router = express.Router({mergeParams : true});
var Campground = require('../models/campground');
var Review = require('../models/review');
var middleware = require('../middleware');

// review Index
router.get('/', (req, res)=>{
    Campground.findById(req.params.id).populate({
       path :  "reviews",
       options : { sort : {createdAt : -1}, limit : 5}

    }).exec((err, foundCampground)=>{
        if (err || !foundCampground){
            req.flash("error", "Campground not found!")
            return res.redirect("back");
        }

        res.render("reviews/index", {campground : foundCampground} );
    })
})

// review New
router.get('/new', middleware.isLoggedIn, middleware.checkReviewExistence,(req, res)=>{
    Campground.findById(req.params.id, (err, foundCampground)=>{
        if (err || !foundCampground){
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render('reviews/new', {campground : foundCampground});
    })

})




module.exports = router;