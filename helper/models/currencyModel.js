// Currency Model
// This model is the structure containing data from the Currency table 
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var currencySchema = new Schema({
    _id:                String,     // Unique Currency code
    index:              Number,     // Indes for sorting
    name:               String,     // Currency name 
    symbol:             String,     // Currency symbol 
    active:             Boolean     // Active True False
});
module.exports = mongoose.model('currencyModel', currencySchema, 'currency');
