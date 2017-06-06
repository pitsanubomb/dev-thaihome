// Rating Model
// This model is the structure containing data from the rating table 
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ratingSchema = new Schema({
    active:             Boolean,    // Is rating active on website true/false 
    property:           String,     // Property ID ---> Property table
    booking:            String,     // Booking ID ---> Booking table
    user:               String,     // User ID ---> Users table
    improve:            String,     // What can we improve
    rating:             String,     // What did the costumer think about the stay
    scores:             String,     // Array of score numbers
    average:            Number,     // Average score
    ratedata:           Number      // The day it was rated
});
module.exports = mongoose.model('ratingModel', ratingSchema, 'rating');
