// Message Model
// This model is the structure containing all unread messages
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    _id:                String,     // Message ID 
    message:            String,     // Array of messages (message, date, manager, property, booking) 
    user:               String,     // User ID --> users table 
    read:               Boolean,    // Read or not
    updated:            Number,     // When was the message last updated
});

module.exports = mongoose.model('messageModel', messageSchema,'message');
