// NatChan Route
// This Route will send all data for NatChan report
// GET INPUT:
// - From and To Date
// - Multiple properties or ALL
// OUTPUT:
// - Json structure with all NatChan report data
//

var express = require('express');
var router = express.Router();
var natChanController = require('../controllers/natChanController');

router.post('/getNatChan', function(req, res) {
	natChanController.getNatChan(req, res);
});

module.exports = router;

