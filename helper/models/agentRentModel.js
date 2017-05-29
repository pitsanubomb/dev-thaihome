// agentRentModel Model
// This model is the structure containing all data for the Agent Rents Report
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var agentRentSchema = new Schema({
    _id:                String,     // Property ID
    name:               String,     // Property Name
    unitNumber:         String,     // Unit Number
    propertyType:       String,     // Property Type
    sqm:                Number,     // Sqm Size 
    priceWeek1:         Number,     // priceWeek1
    commissionDay:      Number,     // commissionDay Pct
    priceWeek2:         Number,     // priceWeek2
    commissionWeek:     Number,     // commissionWeek Pct
    priceMonth1:        Number,     // priceMonth1
    commissionMonth:    Number,     // commissionMonth Pct
    priceMonth6:        Number,     // priceMonth6
    priceYear:          Number,     // Rent price pr day for year
    floor:              String,     // Floor
    view:               String,     // View
    furnished:          String,     // Furnished
    checkout:           Number      // Date when condo is available
});

module.exports = mongoose.model('agentRentModel', agentRentSchema, 'property');
