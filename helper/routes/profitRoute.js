// Profit and Performance Route
// This Route will send all data for Profit and Performance reports
// GET INPUT:
// - From and To Date
// - Multiple properties or ALL
// OUTPUT:
// - Json structure with all booking list data
//

var express = require('express');
var router = express.Router();
var profittController = require('../controllers/profitController');

router.post('/getProfit', function(req, res) {
	profittController.getProfit(req, res);
});

module.exports = router;

