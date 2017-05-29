var express = require('express');
var router = express.Router();
var translationController = require('../controllers/translationController');

router.get('/getTranslation/:propertyID', function(req, res) {
	console.log("Router received: " + req.params.propertyID);
	translationController.getTranslate(req, res);
});

module.exports = router;


