// Language Model
// This model is the structure containing data from the Language table 
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var languageSchema = new Schema({
    _id:                String,     // Unique Language code
    name:               String,     // Name of the language
    browserLanguage:    String,     // The browsers language
    active:             Boolean     // Active true or false 
});
module.exports = mongoose.model('languageModel', languageSchema, 'language');
