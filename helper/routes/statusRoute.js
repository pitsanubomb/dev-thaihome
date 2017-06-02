// Finance Status Route
// This Route will give you data for this months financials
// GET INPUT:
// - From Date To Date
// OUTPUT:
// - Json structure with all financial data
//


var express = require('express');
var router = express.Router();
var statusController = require('../controllers/statusController');

router.post('/getStatus', function(req, res) {
	statusController.getStatus(req, res);
});

module.exports = router;

