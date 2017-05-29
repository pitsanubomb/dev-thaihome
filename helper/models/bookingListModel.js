// Booking List Model
// This model is the structure containing data to be used for booking list
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookingListSchema = new Schema({
    _id:                String,     // Booking ID
    property:           String,     // Property ID
    source:             Number,     // Channel that booked it 
    status:             Number,     // Booking Status 
    checkin:            Number,     // Checkin Date 
    checkout:           Number,     // Checkout Date 
    name:               String,     // Tenant Name
    agent:              String,     // Agent Name
    langCode:           String,     // Language Code
    priceDay:           Number,     // Price pr night 
    nights:             Number     // Number of nights 
});

module.exports = mongoose.model('bookingListModel', bookingListSchema,'booking');

