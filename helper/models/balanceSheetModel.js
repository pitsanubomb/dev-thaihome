// Balance Sheet Model
// This model is the structure containing data to be used for property balance sheet 
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var balanceSheetSchema = new Schema({
    _id:                String,     // Bookin ID
    checkin:            Number,     // Checkin Date 
    checkout:           Number,     // Checkout Date 
    invoice:            String,     // All invoice fields
    receipt:            String      // All receipt fields
});

module.exports = mongoose.model('balanceSheetModel', balanceSheetSchema,'booking');

