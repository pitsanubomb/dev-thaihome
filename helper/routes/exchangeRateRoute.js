// Exchange Rate Route
// This Route will get all the currency exchange rates from API
// GET INPUT:
// - http://www.apilayer.net/api/live?access_key=e8aff3413aa473adca5877468d1fbdb1
// OUTPUT:
// - Json structure with all exchange rates
//
var express = require('express');
var router = express.Router();
var exchangeRateController = require('../controllers/exchangeRateController');
router.get('/getRates', function(req, res){
	exchangeRateController.getRates(req, res);
});
module.exports = router;
