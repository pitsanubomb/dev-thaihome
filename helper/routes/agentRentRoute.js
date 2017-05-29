// Agent Rent Route
// This Route will give you data for Agent Rent Report
// GET INPUT:
// - List of property ID's or ALL
// OUTPUT:
// - Json structure with all data for the Agent Rent Report
//

var express = require('express');
var router = express.Router();
var agentRentController = require('../controllers/agentRentController');

router.post('/getAgentRentReport', function(req, res) {
	console.log("getAgentRentReport received: " + req.body);
	agentRentController.getAgentRentReport(req, res);
});

module.exports = router;

