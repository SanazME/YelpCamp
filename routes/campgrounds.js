var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');


// Shows a list of campgrounds
// INDEX route
router.get('/', (req, res) => {
    // console.log(req);
    // Get all campground from DB
    Campground.find({}, (err, allCampgrounds) => {
        if (err) {
            console.log("Error happened!", err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds, currentUser: req.user });
        };
    });
});

// NEW ROUTE - show form to create a new campground
// 3rd Rest convention, a route to show the form that sends the data to router.POST('/campgrounds')
router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
})

// CREATE ROUTE
// following REST convention, use the same name /campgrounds for POST (creating a campground)
router.post('/', middleware.isLoggedIn, (req, res) => {
    // get data from form and add to campgrounds array
    // console.log(req.body);
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var descrip = req.body.description;
    var location = req.body.location;
    // Add username and id to the newly created campground
    var author = { id: req.user._id, username: req.user.username };
    var newCampground = { name: name, price: price, image: image, location:location, description: descrip, author: author };
    console.log("The user is", req.user);

    // Adding to DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if (err) {
            console.log('Error adding a new campground', err);
        } else {
            // Check to see the user who created the campground
            console.log("User who created the new campground:", newlyCreated.author);
            // redirect back to campground
            res.redirect('/campgrounds');
        }
    });
});

// SHOW route - show information about one campground
router.get('/:id', (req, res) => {
    // Find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            // console.log(foundCampground);
            // Render show template with that campground 
            res.render("campgrounds/show", { campground: foundCampground });
            // console.log(foundCampground);
        };
    });
});

// EDIT Campground ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
    // find the campground
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", { campground: foundCampground });
    });
});


// UPDATE campground ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
        // find and update the correct campground
        console.log(req.body.campground);
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
            if (err) {
                res.redirect("/campgrounds");
            } else {
                // redirect somewhere (show page )
                res.redirect("/campgrounds/" + req.params.id);
                // res.redirect("/campground/"+ updatedCampground._id);
            }
        })
    })

// DELETE Campground route
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res, next) => {
        Campground.findById(req.params.id, (err, foundCampground)=>{
            if (err){
                res.redirect("/campgrounds");
            }
            Comment.deleteMany({
                _id : { $in : foundCampground.comments}
            }, (err)=>{
                if (err) return next(err);
                foundCampground.remove();
                // req.flash('success', 'Campground deleted successfully!');
                res.redirect("/campgrounds");
            })
        })

        // Campground.findByIdAndRemove(req.params.id, (err, deletedCampground) => {
        //     if (err) {
        //         res.redirect("/campgrounds");
        //     } else {
        //         res.redirect("/campgrounds");
        //     }
        // })
})

module.exports = router;