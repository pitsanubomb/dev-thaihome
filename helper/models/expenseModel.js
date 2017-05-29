// Expense Model
// This model is the structure containing data from the expense table 
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseSchema = new Schema({
    _id:                Number,     // Transaction Number
    expenseCategory:    String,     // Expense Category --> link to expensecategory table
    dueDate:            Number,     // The date the exense should be paid
    fromDate:           Number,     // From date with stretch expenses
    toDate:             Number,     // To date with stretch expenses
    paidDate:           Number,     // The date the expense was paid
    propertyId:         String,     // Property ID --> link to property table
    amount:             Number,     // Amount paid
    text:               String,     // Text explaining the expense
    account:            String,     // Bank Account --> link to bank table
    bookingId:          String,     // Booking ID --> link to booking table
    managerId:          String      // Managers UserID --> link to user table
});

module.exports = mongoose.model('expenseModel', expenseSchema,'expense');
