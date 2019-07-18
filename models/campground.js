var mongoose = require('mongoose');

// Schema setup for Mongoose
var campgroundSchema = new mongoose.Schema({
    name: String,
    price : Number,
    image: String,
    description: String,
    author : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "User"
        },
        username : String
    },
    comments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ]
});

// Create a model with built-in methods
// var Campground = new mongoose.model("Campground", campgroundSchema);

module.exports = mongoose.model("Campground", campgroundSchema);