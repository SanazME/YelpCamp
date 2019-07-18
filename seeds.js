var monsoose = require('mongoose'),
    Campground = require('./models/campground'),
    Comment = require('./models/comment');

// Define some data
var campgrounds = [
    {
        name: "Branbury Park",
        image: "/img/camper-55e4d5454b_340.jpg",
        author: {
            id: "5d231c4688c40d10da6a518f",
            username: "Bob"
        },
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean consectetur neque sed augue bibendum, tincidunt venenatis nisi posuere. Nam molestie bibendum elementum. Nam volutpat vulputate dui, sit amet bibendum arcu lobortis vitae. Vestibulum viverra blandit velit at vehicula. Sed viverra neque velit, ac bibendum mauris finibus a. Proin pretium, sapien in auctor ullamcorper, est dui pharetra leo, a elementum massa orci quis odio. Donec tempus molestie fringilla. Suspendisse dignissim nibh eget nunc elementum, vitae dictum libero scelerisque. Nunc condimentum metus ac sem consectetur, at molestie orci consectetur. Nullam eget faucibus dui, eget suscipit est."
    },

    {
        name: "Deere Park",
        image: "/img/camping-tipi-55e9d04348_340.jpg",
        author: {
            id: "5d18f12ef941a30c6e1e8837",
            username: "Louise"
        },
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean consectetur neque sed augue bibendum, tincidunt venenatis nisi posuere. Nam molestie bibendum elementum. Nam volutpat vulputate dui, sit amet bibendum arcu lobortis vitae. Vestibulum viverra blandit velit at vehicula. Sed viverra neque velit, ac bibendum mauris finibus a. Proin pretium, sapien in auctor ullamcorper, est dui pharetra leo, a elementum massa orci quis odio. Donec tempus molestie fringilla. Suspendisse dignissim nibh eget nunc elementum, vitae dictum libero scelerisque. Nunc condimentum metus ac sem consectetur, at molestie orci consectetur. Nullam eget faucibus dui, eget suscipit est."
    },
    {
        name: "Bruce Peninsula",
        image: "/img/lake-55e7d24a48_340.jpg",
        author: {
            id: "5d231a5ec0f14b10b974ef99",
            username: "Gorbi"
        },
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean consectetur neque sed augue bibendum, tincidunt venenatis nisi posuere. Nam molestie bibendum elementum. Nam volutpat vulputate dui, sit amet bibendum arcu lobortis vitae. Vestibulum viverra blandit velit at vehicula. Sed viverra neque velit, ac bibendum mauris finibus a. Proin pretium, sapien in auctor ullamcorper, est dui pharetra leo, a elementum massa orci quis odio. Donec tempus molestie fringilla. Suspendisse dignissim nibh eget nunc elementum, vitae dictum libero scelerisque. Nunc condimentum metus ac sem consectetur, at molestie orci consectetur. Nullam eget faucibus dui, eget suscipit est."
    },
    {
        name: "Bruce Peninsula",
        image: "/img/lake-sara-57e8dc414e_340.jpg",
        author: {
            id: "5d2319d610679310b499625a",
            username: "Mimi"
        },
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean consectetur neque sed augue bibendum, tincidunt venenatis nisi posuere. Nam molestie bibendum elementum. Nam volutpat vulputate dui, sit amet bibendum arcu lobortis vitae. Vestibulum viverra blandit velit at vehicula. Sed viverra neque velit, ac bibendum mauris finibus a. Proin pretium, sapien in auctor ullamcorper, est dui pharetra leo, a elementum massa orci quis odio. Donec tempus molestie fringilla. Suspendisse dignissim nibh eget nunc elementum, vitae dictum libero scelerisque. Nunc condimentum metus ac sem consectetur, at molestie orci consectetur. Nullam eget faucibus dui, eget suscipit est."
    },
];

function seedDB() {
    // Remove all the documents from the database Campground
    Campground.deleteMany({}, err => {
        if (err) {
            console.log(err);
        } else {
            console.log('removed campgrounds!');
            Comment.deleteMany({}, err => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Comments are deleted!")
                    // Add a few campgrounds
                    campgrounds.forEach(campground => {
                        Campground.create(campground, (err, campground) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("added a campground", campground.name);
                                // Add a few comments for each campground
                                Comment.create(
                                    {
                                        text: "This place is great!",
                                        author: {
                                            id : '12345678',
                                            username : "Homer"
                                        }
                                    }, (err, comment) => {
                                        if (err) {
                                            console.log('No comment created');
                                        } else {
                                            // once comment is created we want to associate it to the campground 
                                            campground.comments.push(comment);
                                            campground.save()
                                            console.log("Created & added a new comment")
                                        }
                                    })
                            };
                        });
                    });

                }
            })

        };
    });

};

module.exports = seedDB;