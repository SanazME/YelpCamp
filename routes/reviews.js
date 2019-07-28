var express = require('express');
var router = express.Router({mergeParams : true});
var Campground = require('../models/campground');
var Review = require('../models/review');
var middleware = require('../middleware');