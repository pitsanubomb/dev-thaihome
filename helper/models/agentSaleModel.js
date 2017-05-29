// agentSaleModel Model
// This model is the structure containing all data for the Agent Sales Report
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var agentSaleSchema = new Schema({
    _id:                String,     // Property ID
    name:               String,     // Property Name
    unitNumber:         String,     // Unit Number
    propertyType:       String,     // Property Type
    sqm:                Number,     // Sqm Size 
    ownership:          String,     // Ownership
    saleprice:          Number,     // Sales price
    salecommission:     Number,     // Sales Commission Pct
    priceYear:          Number,     // Rent price pr day for year
    floor:              String,     // Floor
    view:               String,     // View
    furnished:          String      // Furnished
});

module.exports = mongoose.model('agentSaleModel', agentSaleSchema, 'property');

