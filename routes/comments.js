var express = require('express');
var router = express.Router({ mergeParams: true });
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');

// Comments new
router.get('/new', middleware.isLoggedIn, (req, res) => {
    // Find campground by Id
    console.log(req.params.id);
    Campground.findById(req.params.id, (err, foundComment) => {
        if (err) {
            console.log(err);
        } else {
            res.render('comments/new', { campground: foundComment });
        };
    });
});

// Comments create
router.post('/', middleware.isLoggedIn, (req, res) => {
    // lookup camground using Id
    // create new comment
    // connect new comment to campground
    // redirect to campground showpage

    // lookup camground using Id
    Campground.findById(req.params.id, (err, foundComment) => {
        if (err) {
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            // create new comment
            Comment.create(req.body.comment, (err, createdComment) => {
                if (err) {
                    req.flash("error", "Something went wrong...")
                    console.log('No comments created');
                } else {
                    // add username and id to comment
                    console.log("the user object : " + req.user);
                    createdComment.author.id = req.user._id;
                    createdComment.author.username = req.user.username;
                    console.log("createdComment is :", createdComment);
                    console.log(createdComment.author.username);
                    // save comments
                    createdComment.save();
                    console.log(createdComment);
                    // console.log(req.body.comment);
                    foundComment.comments.push(createdComment);
                    foundComment.save();
                    req.flash("success", "Created comment successfully")
                    res.redirect('/campgrounds/' + foundComment._id);
                }
            });
        }
    })
})

// Comments edit route
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
    // res.send(req.params);
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err) {
            res.redirect("back");
        } else {
            // we have the campground id because of our route here : campgrounds/:id/comments/:comment_id/edit
            res.render('comments/edit', { comment: foundComment, campground_id: req.params.id });
        }
    });
})

// Comments UPDATE ROUTE
// campgrounds/:id/comments/:comment_id
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    console.log(req.body.comment.text)

    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    })
})

// COMMENTS DESTROY ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    // res.send("Deleting a comment")
    Comment.findByIdAndDelete(req.params.comment_id, (err, deletedComment) => {
        if (err) {
            res.redirect("back");
        } else {
            console.log(deletedComment)
            req.flash("success", "Deleted comment successfully");
            res.redirect('/campgrounds/' + req.params.id)
        }
    })
})

module.exports = router;
