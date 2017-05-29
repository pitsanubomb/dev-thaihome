// Balance Sheet Route
// This Route will send all data for property balance sheet
// GET INPUT:
// - From and To Date
// - Single property
// OUTPUT:
// - Json structure with all balancesheet data
//

var express = require('express');
var router = express.Router();
var balanceSheetController = require('../controllers/balanceSheetController');

router.post('/getBalanceSheet', function(req, res) {
	balanceSheetController.getBalanceSheet(req, res);
});

module.exports = router;

