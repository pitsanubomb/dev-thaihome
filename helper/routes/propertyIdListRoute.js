// Property ID Route
// This Route will return a list of all property ID's
// GET INPUT:
// - none
// OUTPUT:
// - Json structure with all property ID's
//

var express = require('express');
var router = express.Router();
var propertyIdListController = require('../controllers/propertyIdListController');

router.get('/getPropertyIdList', function(req, res) {
	propertyIdListController.getPropertyIdList(req, res);
});

module.exports = router;

