// News Model
// This model is the structure containing data from the news table 
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var newsSchema = new Schema({
    _id:                String,     // Unique ID for the news item
    start:              Number,     // Stat Date (unix format)
    end:                Number,     // End Date (unix format)
    text:               String      // The news text 
});

module.exports = mongoose.model('newsModel', newsSchema,'news');
