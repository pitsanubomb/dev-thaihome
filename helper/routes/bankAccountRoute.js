// Bank Account Route
// This Route will give you data for Bank Account Report
// GET INPUT:
// - From and To Date
// - List of property ID's or ALL
// OUTPUT:
// - Json structure with all data for the Bank Account Report
//

var express = require('express');
var router = express.Router();
var bankAccountController = require('../controllers/bankAccountController');

router.post('/getBankAccountReport', function(req, res) {
	console.log("getBankAccountReport received: " + req.body);
	bankAccountController.getBankAccountReport(req, res);
});

module.exports = router;

