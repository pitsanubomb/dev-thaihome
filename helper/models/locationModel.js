// Location Model
// This model is the structure containing data from the location table 
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
    _id:                Number,     // Unique ID for the location
    name:               String      // Name of the location
});

module.exports = mongoose.model('locationModel', locationSchema,'location');
