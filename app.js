var express       = require('express'),
    app           = express(),
    mongoose      = require('mongoose'),
    flash         = require('connect-flash'),
    passport      = require('passport'),
    LocalStrategy = require('passport-local'),
    methodOverride= require('method-override'),
    passportLocalMongoose = require('passport-local-mongoose'),
    Campground    = require('./models/campground'),
    Comment       = require('./models/comment'),
    User          = require('./models/user'),
    seedDB        = require('./seeds');

var compgroundRoutes   = require('./routes/campgrounds'),
    commentRoutes      = require('./routes/comments'),
    indexRoutes        = require('./routes/index'); //auth routed 

var url = process.env.DATABASEURL; //|| "mongodb://localhost/yelp_camp_v10";
console.log("Environemnt Varirable:",url);
mongoose.connect(url, {
    useNewUrlParser : true,
    useCreateIndex : true
}).then(()=>{
    console.log("Connected to DB ....")
}).catch(err=>{
    console.log("Error : ", err)
});

var port = process.env.PORT || 3000;

app.set("view engine", "ejs")
app.use(express.json()) //for parsing application/JSON
app.use(express.urlencoded({ extended: true })); //for parsing application/x-www-form-urlencoded
app.use(express.static(__dirname + "/public")); //__dirname: /Users/sanaz/work/Web Development Cole/backend/YelpCamp/v5
app.use(methodOverride("_method"));
app.use(flash());


// Execute seedDB everytime we start the server
// it executes the functiom seedDB exported from the line above
// seedDB(); //seed the datebase

//////// PASSPORT CONFIGURATION
// use express-session
app.use(require('express-session')({
    secret : "Gorbi is the cutest cat!",
    resave : false,
    saveUninitialized : false
}));
// instruct express to use passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Middleware for passing req.user to all templates so their header can see it
// anything inside req.locals will be available to the templates
app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next()
})

// Requiring routes
app.use("/",indexRoutes);
app.use("/campgrounds",compgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

// Connect to the MongoDB , first download dotenv from npm
// require('dotenv').config();
// mongoose.connect(process.env.DATABASEURL, {
//     useNewUrlParser: true,
//     useCreateIndex: true
// }).then(() => {
//     console.log('Connected to DB!');
// }).catch(err => {
//     console.log('Error : ', err.message);
// });


app.listen(port, () => {
    console.log("YelpCamp Server started ...", port)
});