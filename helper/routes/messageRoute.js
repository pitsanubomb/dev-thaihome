// Message Route
// This Route will give you data for all unread messages
// GET INPUT:
// - none
// OUTPUT:
// - Json structure with all unread messages
//


var express = require('express');
var router = express.Router();
var messageController = require('../controllers/messageController');

router.get('/getMessageUnread', function(req, res) {
	messageController.getMessageUnread(req, res);
});

module.exports = router;

