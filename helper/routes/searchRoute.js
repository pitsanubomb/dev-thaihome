// Search Result Page Route
// This Route will get data needed by the search result page
//		all locations from "location" table (jomtien, pattaya, naklua...)
//		all properties that are available in the choosen period with prices and hotdeals
//		all properties that are occupied in the choosen period with prices and hotdeals
// GET INPUT:
// - from / to date
// OUTPUT:
// - Json structure with all data needed for the search result page
//
var express = require('express');
var router = express.Router();
var searchController = require('../controllers/searchController');
router.post('/getSearch', function(req, res) {
	searchController.getSearch(req, function(result) {
		res.json(result);
	});
});
module.exports = router;
