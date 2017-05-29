//Receipt Model
// This model is the structure containing data from the receipt table 
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var receiptSchema = new Schema({
    _id:                Number,     // Receipt Number
    invoiceNo:          Number,     // Receipt belong to Invoice Number 
    bookingId:          String,     // Booking ID
    paidDate:           Number,     // The date the invoice was paid and the receipt created
    amount:             Number,     // Amount received
    account:            String,     // Bank Account --> link to bank table
    managerId:          String     // Managers UserID --> link to user table
});

module.exports = mongoose.model('receiptModel', receiptSchema,'receipt');

