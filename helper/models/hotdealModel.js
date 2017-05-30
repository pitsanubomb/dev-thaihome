// Global HotDeal Model
// This model is the structure containing hotdeals for a property
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hotdealSchema = new Schema({
    _id:       String,     // Unique ID 
    property:  Number,     // Property ID 
    discount:  Number,     // Discount in percentage 
    start:     Number,     // Start date for deal UNIX
    end:       Number,     // End date for deal UNIX
    hot:       Boolean,    // Is this a hotdeal?
    active:    Boolean     // Is this deal active?
});

module.exports = mongoose.model('hotdealModel', hotdealSchema,'hotdeal');
