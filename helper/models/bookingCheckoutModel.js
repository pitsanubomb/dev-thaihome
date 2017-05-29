// bookingCheckout Model
// This model is the structure containing when each unit will be available again
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookingCheckoutSchema = new Schema({
    _id:        String,    // Property ID 
    checkout:   Number     // When will the property be available 
});

module.exports = mongoose.model('bookingCheckoutModel', bookingCheckoutSchema,'booking');
