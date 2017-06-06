// Property Route
// This Route will return all data for a specific property
// POST INPUT:
// - PropertyID or array of property id's
// OUTPUT:
// - Json structure with all property data
//
var express = require('express');
var router = express.Router();
var propertyController = require('../controllers/propertyController');
router.post('/getProperty', function(req, res) {
	propertyController.getProperty(req, function(result) {
		res.json(result);
	});
});
module.exports = router;
