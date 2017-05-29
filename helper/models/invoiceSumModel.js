// Invoice Sum Model
// This model is the structure containing data from the invoice table 
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var invoiceSumSchema = new Schema({
    _id:                Number,     // Invouce Number
    dueDate:            Number,     // When must the invoice be paid 
    sum:                Number      // All lines counted together
});

module.exports = mongoose.model('invoiceSumModel', invoiceSumSchema,'invoice');

