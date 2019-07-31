var express = require('express');
var router = express.Router({ mergeParams: true });
var Campground = require('../models/campground');
var Review = require('../models/review');
var middleware = require('../middleware');

// review Index
router.get('/', (req, res) => {
    // console.log("review Index route")
    Campground.findById(req.params.id).populate({
        path: "reviews",
        options: { sort: { createdAt: -1 }, limit: 5 }

    }).exec((err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found!")
            return res.redirect("back");
        }

        res.render("reviews/index", { campground: foundCampground });
    })
})

// review New
router.get('/new', middleware.isLoggedIn, middleware.checkReviewExistence, (req, res) => {
    // middleware.checkReviewExistence checks if the user already reviewed the campground
    // only one review per user for a given campground is allowed
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render('reviews/new', { campground: foundCampground });
    })
    // console.log("Add new Review!")
})

// // review CREATE 
router.post('/', middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
    // lookup campground by id
    // create new review
    // connect new review to campground
    // redirect to campground show page

    Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }

        // create a new review
        Review.create(req.body.review, (err, createdReview) => {
            if (err) {
                req.flash("error", "Input review not found!");
                return res.redirect("/campgrounds");
            }
            // add username and id and associated campground to review
            createdReview.author.id = req.user._id;
            createdReview.author.username = req.user.username;
            createdReview.camground = foundCampground;

            // save review
            createdReview.save();

            // Connect new reciew to campground
            foundCampground.reviews.push(createdReview);
            // Calculate campground new average rating
            foundCampground.rating = calculateAverageRating(foundCampground.reviews);
            // Save 
            foundCampground.save();

            // Redirect to that campground page
            req.flash("success", "Created review successfully");
            res.redirect('/campgrounds/' + foundCampground._id);
        });
    });
});

// Review Edit route
router.get('/:review_id/edit', middleware.checkReviewOwnership, (req, res) => {
    Review.findById(req.params.review_id, (err, foundReview) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        };
        res.render('/reviews/edit', { review: foundReview, camground_id: req.params.id });
    })
    // res.send("Edit REview!")
})

// // review Update route
router.put('/:review_id', middleware.checkReviewOwnership, (req, res) => {

    Review.findByIdAndUpdate(req.params.review_id, req.body.review, { new: true }, (err, updatedReview) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect('back');
        }
        // find the campground and update reviews and average rating
        Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // calculate average review for campground
            foundCampground.rating = calculateAverageRating(foundCampground.reviews);
            // Save
            foundCampground.save();

            req.flash("success", "Review is updated successfully");
            res.redirect("/campgrounds/" + req.params.id);
        })
    })
})

router.delete('/:review_id', middleware.checkCommentOwnership, (req, res) => {

    Review.findByIdAndDelete(req.params.review_id, (err, deletedReview) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect('back');
        }
        // Update campground average rating
        console.log("deleted Review id: " + deletedReview._id);

        Campground.findByIdAndUpdate(req.params.id, { $pull: { reviews: deletedReview._id } }, { new: true }).populate("reviews").exec((err, updatedCampground) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // Update average rating
            foundCampground.rating = calculateAverageRating(foundCampground.reviews);
            foundCampground.save();

            req.flash("success", "Review is deleted successfully!");
            return res.redirect('/campgrounds/' + foundCampground._id);
        })
    })
});


function calculateAverageRating(reviews) {
    if (reviews.length === 0) {
        return 0
    };
    var totReview = 0
    reviews.forEach(review => {
        totReview += review.rating;
    });
    return totReview / reviews.length;
}



module.exports = router;