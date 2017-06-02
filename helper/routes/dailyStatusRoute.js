// Status Route
// This Route will send all data for Daily Status Report
// GET INPUT:
// - From and To Date
// OUTPUT:
// - Json structure with all Daily Status Report data
//

var express = require('express');
var router = express.Router();
var statusController = require('../controllers/statusController');

router.post('/getStatus', function(req, res) {
	statusController.getStatus(req, res);
});

module.exports = router;

