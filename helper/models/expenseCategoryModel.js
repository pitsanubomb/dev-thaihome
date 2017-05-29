// ExpenseCategory Model
// This model is the structure containing the Expense Category
//

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseCategorySchema = new Schema({
    _id:    String,     // Expense Category ID 
    name:   String      // Category information
});

module.exports = mongoose.model('expenseCategoryModel', expenseCategorySchema,'expensecategory');
