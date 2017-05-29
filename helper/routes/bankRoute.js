// Bank Route
// This Route will return a list of all Bank accounts
// GET INPUT:
// - none
// OUTPUT:
// - Json structure with all Bank accounts
//

var express = require('express');
var router = express.Router();
var bankController = require('../controllers/bankController');

router.get('/getBankList', function(req, res) {
	bankController.getBankList(req, res);
});

module.exports = router;

