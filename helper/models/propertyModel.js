// Global Property Model
// This model is the structure containing the data for properties
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var propertySchema = new Schema({
    _id:                String,     // Unique property ID
    location:           String,     // Property location ID --> Location
    mindays:            Number,     // Minimum number of days to rent
    name:               String,     // Building Sort Name
    locationName:       String,     // Location Name Text
    projectName:        String,     // Project Long Name
    propertyType:       String,     // Property Type Condo/House
    unitType:           String,     // Unit Type Studio/1 Bedroom...
    unitNumber:         String,     // Unit Number in building
    guests:             Number,     // Number of guests (must be numeric)
    sqm:                Number,     // Size in Sqm
    bedrooms:           Number,     // Number of bedrooms
    bathrooms:          Number,     // Number of bathrooms
    livingrooms:        Number,     // Number of livingrooms
    electricUnit:       Number,     // Price pr electric unit
    waterUnit:          Number,     // Price pr water unit
    address1:           String,     // Address line 1 English
    address2:           String,     // Address line 2 English
    address3:           String,     // Address line 3 English
    thaiAddress:        String,     // Thai address
    gmapslink:          String,     // Google Maps Link
    gmapsdata:          String,     // Google Maps coordinates
    purchaseprice:      Number,     // Purchase Price
    saleprice:          Number,     // Sales Price
    salecommission:     Number,     // Sales Commission in percentage for agent
    ownership:          String,     // Ownership Thai company or Foreigner
    cleanprice:         Number,     // Price pr cleaning
    cleanfinalprice:    Number,     // Price for final cleaning
    images:             String,     // Array of images
    featured:           String,     // Featured image / first image
    amenities:          String,     // Array of Amenities
    dropbox:            String,     // Dropbox folder
    dropboxPdf:         String,     // Dropbox PDF information sheet
    dropboxWeb:         String,     // Dropbox images for web
    dropboxHq:          String,     // Dropbox HQ images
    conditionsAgent:    String,     // Special conditions for agents
    conditionsTenant:   String,     // Special conditions for tenants
    active:             Boolean,    // True if property is active
});
module.exports = mongoose.model('propertyModel', propertySchema, 'property');
