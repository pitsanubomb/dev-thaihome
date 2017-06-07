// Header Footer Route
// This Controller will give you data for the header and footer
// GET INPUT:
// - none
// OUTPUT:
// - Json structure with the following data:
// - language[] with all languages 
// - currency[] with all currencies
//
//
var express = require('express');
var router = express.Router();
var headerFooterController = require('../controllers/headerFooterController');
router.get('/getHeaderFooter', function(req, res) {
	headerFooterController.getHeaderFooter(req, function(result) {
		res.json(result);
	});
});
module.exports = router;
