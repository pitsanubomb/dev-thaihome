// Booking Checkin Route
// This Route will give you data for Checkin/Checkout today and tomorrow
// GET INPUT:
// - From and To Date
// - Multiple properties or ALL
// - Booking Status
// OUTPUT:
// - Json structure with all booking data
//

var express = require('express');
var router = express.Router();
var bookingCheckinController = require('../controllers/bookingCheckinController');

router.post('/getBookingCheckin', function(req, res) {
	bookingCheckinController.getBookingCheckin(req, res);
});

module.exports = router;

