// Currency Exchange Rate Model
// This model is the structure containing the data from the currency exchange rate API call
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var exchangeRateSchema = new Schema({
    date: Number,
    data:String
});
module.exports = mongoose.model('exchangeRate', exchangeRateSchema, 'currencydata');