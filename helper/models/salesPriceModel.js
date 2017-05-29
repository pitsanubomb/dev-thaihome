// Sales Price Model
// This model is the structure containing properties sales prices to be used for property balance sheet 
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salesPriceSchema = new Schema({
    _id:                String,     // Property ID
    saleprice:          Number      // Sales Price 
});

module.exports = mongoose.model('salesPriceModel', salesPriceSchema,'property');

