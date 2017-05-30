// Frontpage Route
// This Route will get data needed by the front page
//		all featured images from "featured" table
//		all locations from "location" table (jomtien, pattaya, naklua...)
//		all news from "news" table
//		all hotdeals from "hotdeal" table
//		all prices from "price" table to match hotdeal
// GET INPUT:
// - none
// OUTPUT:
// - Json structure with all data needed for the front page
//

var express = require('express');
var router = express.Router();
var locationController = require('../controllers/frontpageController');

router.get('/getFrontpage', function(req, res) {
	frontpageController.getFrontpage(req, res);
});

module.exports = router;
