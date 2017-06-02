// profit Model
// This model is the structure containing all data for Profit and Performance Reports
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var profitSchema = new Schema({
    _id:                String,     // Property ID 
    name:               String,     // Property Name 
    sqm:                Number,     // Sqm Size 
    purchaseprice:      Number,     // Purchase price
    saleprice:          Number,     // Sales price
    priceWeek2:         Number,     // Rent price pr day for week
    priceYear:          Number,     // Rent price pr day for year
    expense:            String      // All fields from expense table
});

module.exports = mongoose.model('profitModel', profitSchema,'property');

