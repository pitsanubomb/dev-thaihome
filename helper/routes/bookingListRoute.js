// Booking List Route
// This Route will send all data for property balance sheet
// GET INPUT:
// - From and To Date
// - Multiple properties or ALL
// - Booking Status
// OUTPUT:
// - Json structure with all booking list data
//

var express = require('express');
var router = express.Router();
var bookingListController = require('../controllers/bookingListController');

router.post('/getBookingList', function(req, res) {
	bookingListController.getBookingList(req, res);
});

module.exports = router;

