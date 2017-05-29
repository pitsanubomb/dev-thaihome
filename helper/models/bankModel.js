// bank Model
// This model is the structure containing all data for the bank table
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bankSchema = new Schema({
    _id:                String,     // Bank Account ID
    account:            String,     // Account Name
    accountNo:          String,     // Account Number
    accountHolder:      String,     // Account Holder
    IBAN:               String,     // IBAN No 
    SWIFT:              String,     // SWIFT
    bank:               String,     // Bank short name
    bankName:           String,     // Bank long name
    bankBranch:         String,     // Bank branch
    bankAddress:        String,     // Bank Address
    bankPhone:          String,     // Bank Phone
    priceMonth6:        String      // What do we use it for?
});

module.exports = mongoose.model('bankModel', bankSchema, 'bank');
