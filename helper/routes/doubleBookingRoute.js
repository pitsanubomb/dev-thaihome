// Double Booking Route
// This Route will send all Double Bookings
// GET INPUT:
// - Nothing
// OUTPUT:
// - Json structure with all Double Bookings and all Same Day Bookings
// - { doubleBookings: data, sameDayBookings: data}


var express = require('express');
var router = express.Router();
var doubleBookingController = require('../controllers/doubleBookingController');

router.get('/getDoubleBooking', function(req, res) {
	doubleBookingController.getDoubleBooking(req, res);
});

module.exports = router;

