// Global Price Route
// This Route will return the correct price data for any property
// POST INPUT:
// - property ID  (_id from property table)
// - checkin date (unix format)
// - checkout date (unix format)
// OUTPUT:
// - Json structure with all price data (see priceModel.js)
//

var express = require('express');
var router = express.Router();
var priceController = require('../controllers/priceController');

router.post('/getPrice', function(req, res) {
	console.log("getPrice: " + req.body);
	console.log("getPrice received: " + JSON.stringify(req.body, null, 4));
	console.log("propertyID: " +req.body.propertyID);
	console.log("checkin: " +req.body.checkin);
	console.log("checkout: " +req.body.checkout);
	priceController.getPrice(req, res);
});

module.exports = router;

