// Occupancy Route
// This Route will send all data for occupancy report
// GET INPUT:
// - From and To Date
// - Multiple properties or ALL
// OUTPUT:
// - Json structure with all booking list data
//

var express = require('express');
var router = express.Router();
var occupancyController = require('../controllers/occupancyController');

router.post('/getOccupancy', function(req, res) {
	occupancyController.getOccupancy(req, res);
});

module.exports = router;

