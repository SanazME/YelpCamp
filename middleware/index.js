var Campground = require('../models/campground'),
    Comment = require('../models/comment'),
    Review = require('../models/review')





// all the middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    // is user logged in?
    // does user own the campground?
    // otherwise redirect
    // redirect to somewhere
    if (req.isAuthenticated()) {
        // find the campground
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // does user own the campground?
                console.log("foundCampground author's id is :", foundCampground.author.id);
                console.log("Logged in user's id is :", req.user._id);
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission");
                    res.redirect("back");
                }
            }
        })
    } else {
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
    // is user logged in?
    // does user own the comment?
    // otherwise redirect
    // redirect to somewhere
    if (req.isAuthenticated()) {
        // find the campground
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // does user own the comment?
                console.log("foundComment author's id is :", foundComment.author.id);
                console.log("Logged in user's id is :", req.user._id);
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission")
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash("error", "You need to be logged in");
    res.redirect('/login');
}

// 2nd way of defining the middlewareObj:
// var middlewareObj = {
//     checkCampgroundOwnership : function(){

//     }
//     ...
// }

// 3rd way of defining middlewareObj is:
// module.exports = {
//     checkCampgroundOwnership : function(){

//     }
// }


// check if the existing user has a review
middlewareObj.checkReviewExistence = (req, res, next) => {
    if (req.isAuthenticated()) {
        // find the review
        Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found!");
                return res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });

                if (foundUserReview) {
                    req.flash("error", "User has already reviewed this campground!");
                    return res.redirect('campground/' + foundCampground._id);
                } else {
                    return next();
                }
            }
        })
    } else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }
};

// check if the user has the ownership of the review
middlewareObj.checkReviewOwnership = (req, res, next) => {

    if (req.isAuthenticated()) {
        // find the review
        Review.findById(req.params.review_id, (err, foundReview)=>{
            if (err || !foundReview){
                req.flash("error", "Review not found!");
                return res.redirect("back");
            }
            // check if the user is the owner of review
            if (foundReview.author.id.equals(req.user._id)){
                next();
            } else {
                req.flash("error", "You don't have permission!");
                res.redirect("back");
            }
        });
    } else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }
}


// middlewareObj is an object we define
module.exports = middlewareObj;