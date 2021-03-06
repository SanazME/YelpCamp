var express = require("express");
var router = express.Router();

var multer = require("multer");
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname)
  }
});
var fileFilter = function (req, file, cb) {
  // Accept image files only
  console.log('file.originalname from Multer : ' + file.originalname)
  console.log('type of file.originalname from Multer : ' + typeof (file.originalname))

  var pattern = /\.(jpg|jpeg|png|gif)$/i;
  if (!file.originalname.match(pattern)) {
    return cb(new Error('Only image files are allowed!'), false)
  }
  return cb(null, true)
};
var upload = multer({ storage: storage, fileFilter: fileFilter });

var cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dcxgrsnss',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");
var Review = require("../models/review");

var options = {
  provider: "google",
  httpAdapter: "https", // Default
  apiKey: process.env.GEOCODER_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null
};

var geocoder = NodeGeocoder(options);

// Shows a list of campgrounds
// INDEX route
router.get("/", (req, res) => {
  // console.log(req);
  // Get all campground from DB
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log("Error happened!", err);
    } else {
      res.render("campgrounds/index", {
        campgrounds: allCampgrounds,
        currentUser: req.user
      });
    }
  });
});

// NEW ROUTE - show form to create a new campground
// 3rd Rest convention, a route to show the form that sends the data to router.POST('/campgrounds')
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// CREATE ROUTE
// following REST convention, use the same name /campgrounds for POST (creating a campground)
router.post("/", middleware.isLoggedIn, upload.single('image'), (req, res) => {
  // get data from form and add to campgrounds array
  console.log(req.body);
  var name = req.body.name;
  var price = req.body.price;
  // var image = req.body.image;
  var descrip = req.body.description;
  // Add username and id to the newly created campground
  var author = { id: req.user._id, username: req.user.username };

  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;

    // Cloudinary
    cloudinary.uploader.upload(req.file.path,
      function (error, result) {
        if (error) {
          console.log(error.message);
        }
        // add cloudinary url for the image to the campground object under image property

        var newCampground = {
          name: name,
          price: price,
          image: result.secure_url,
          location: location,
          lat: lat,
          lng: lng,
          description: descrip,
          author: author
        };
        console.log('result.secure_url : ' + result.secure_url)
        console.log("The user is", req.user);
        // Adding to DB
        Campground.create(newCampground, (err, newlyCreated) => {
          if (err) {
            console.log("Error adding a new campground", err);
          } else {
            // Check to see the user who created the campground
            console.log(
              "User who created the new campground:",
              newlyCreated.author
            );
            // redirect back to campground
            res.redirect("/campgrounds/" + newlyCreated.id);
          }
        });
      });
  });
});

// SHOW route - show information about one campground
router.get("/:id", (req, res) => {
  // Find the campground with provided ID
  Campground.findById(req.params.id)
    .populate("comments")
    .populate({
      path: "reviews",
      options: { sort: { createdAt: -1 }, limit: 5 } // sorting the populated reviews array to show the latest first
    })
    .exec((err, foundCampground) => {
      if (err) {
        res.redirect("/campgrounds");
      } else {
        // console.log(foundCampground);
        // Render show template with that campground
        res.render("campgrounds/show", { campground: foundCampground });
        console.log("campground obj passed to show page : " + foundCampground);
      }
    });
});

// EDIT Campground ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
  // find the campground
  Campground.findById(req.params.id, (err, foundCampground) => {
    res.render("campgrounds/edit", { campground: foundCampground });
  });
});

// UPDATE campground ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  // find and update the correct campground
  console.log(req.body.campground);
  // Get geocoder location
  geocoder.geocode(req.body.campground.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Address not found!");
      return res.redirect("back");
    }
    // Store geocoded and location
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    // Update campground
    Campground.findByIdAndUpdate(
      req.params.id,
      req.body.campground,
      (err, updatedCampground) => {
        if (err) {
          req.flash("error", err.message);
          res.redirect("/campgrounds");
        } else {
          req.flash("success", "Campground updated successfully!");
          // redirect somewhere (show page )
          res.redirect("/campgrounds/" + req.params.id);
          // res.redirect("/campground/"+ updatedCampground._id);
        }
      }
    );
  });
});

// DELETE Campground route
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res, next) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      // delete all comment associated with the campground
      Comment.deleteMany({ _id: { $in: foundCampground.comments } }, err => {
        if (err) {
          console.log(err);
          return res.redirect("/campgrounds");
        }

        // Delete all reviews associated with the campground
        Review.deleteMany({ _id: { $in: foundCampground.reviews } }, err => {
          if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
          }

          // Remove campground
          foundCampground.remove();
          req.flash("sucess", "Campground was deleted successfully!");
          return res.redirect("/campgrounds");
        });
      });
    }
  });
});

module.exports = router;
