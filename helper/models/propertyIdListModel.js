// propertyIdList Model
// This model is the structure containing all property IDs
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var propertyIdListSchema = new Schema({
    _id:    String,     // Property ID 
    name:   String      // Property Name 
});

module.exports = mongoose.model('propertyIdListModel', propertyIdListSchema,'property');
