var mongoose = require('mongoose');

// Schema setup for Mongoose
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    // reference to reviews for campground
    review: [
       {
           type : mongoose.Schema.Types.ObjectId,
           ref : "Review"
       }
    ],
    // Campground total Rating for the campground based on averaged all ratings
    rating: {
        type: Number,
        default: 0
    }
});

// Create a model with built-in methods
// var Campground = new mongoose.model("Campground", campgroundSchema);

module.exports = mongoose.model("Campground", campgroundSchema);