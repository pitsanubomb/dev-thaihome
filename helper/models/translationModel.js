var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var translateSchema = new Schema({
    floor: { type: String},
    view: { type: String}
});

module.exports = mongoose.model('translation', translateSchema, 'translation');

