// Global Season Model
// This model is the structure containing the correct price data for all seasons
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var seasonSchema = new Schema({
    from:   Number,     // From date 123 = Jan 23 
    to:     Number,     // To date 1122 = Nov 22
    pct:    Number      // Percentage discount or gain
});

module.exports = mongoose.model('seasonModel', seasonSchema,'season');

