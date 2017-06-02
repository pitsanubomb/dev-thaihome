// Invoice Model
// This model is the structure containing data from the invoice table 
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var invoiceSchema = new Schema({
    _id:                Number,     // Invoice Number
    bookingId:          String,     // Booking ID
    createDate:         Number,     // The date the invoice was created
    dueDate:            Number,     // The date the invoice must be paid
    paidDate:           Boolean,    // Is the invoice paid or not?
    paymentSuggest:     Number,     // Suggested payment method (bank, card, paypal)
    managerId:          String,     // Managers UserID --> link to user table
    invoiceLines:       String,     // A list of invoice lines, text, amount
    includeMissing:     Boolean     // Does the invoice include the missing amount?
});

module.exports = mongoose.model('invoiceModel', invoiceSchema,'invoice');

