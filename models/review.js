var mongoose = require('mongoose');

// Schema setup for mongoose
var reviewSchema = new mongoose.Schema({
    rating: {
        // set the field type
        type: Number,
        // make the star rating required
        required: [true, 'Please provide a rating (1-5 stars).'],
        // define min and max values
        min: 1,
        max: 5,
        // Add validation to check the input is integer
        validate: [
            {
                validator: function (val) {
                    return val.isInteger();
                },
                msg: 'Oh! {PATH} is not an integer!'
            },
            {
                validator: function (val) {
                    return val >= 1;
                },
                msg: 'Oh! {PATH} should be larger then 1!'
            }]
    },
    // Review text
    text: String,

    // author id and username
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },

    // campground associated with the review
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground"
    }
}, {
        // if timestamps set to true, mongoose assigns createdAt and updatedAt fields to the schema. Their type is Date.
        timestamps: true
    });

// Set timestap to true
// reviewSchema.set(timestamps, true);

module.exports = mongoose.model("Review", reviewSchema);