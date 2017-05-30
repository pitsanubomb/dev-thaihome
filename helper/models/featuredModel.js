// Featured Model
// This model is the structure containing data from the featured table 
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var featuredSchema = new Schema({
    _id:                Number,     // Unique ID for the image
    image:              String      // Image file name
});

module.exports = mongoose.model('featuredModel', featuredSchema,'featured');
