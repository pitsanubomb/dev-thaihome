// Agent Sale Route
// This Route will give you data for Agent Sales Report
// GET INPUT:
// - List of property ID's or ALL
// OUTPUT:
// - Json structure with all data for the Agent Sales Report
//

var express = require('express');
var router = express.Router();
var agentSaleController = require('../controllers/agentSaleController');

router.post('/getAgentSaleReport', function(req, res) {
	console.log("getAgentSaleReport received: " + req.body);
	agentSaleController.getAgentSaleReport(req, res);
});

module.exports = router;

