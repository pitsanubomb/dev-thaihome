// Expense Route
// This Route will send all expenses
// GET INPUT:
// - Array of expenseCategories or ALL
// OUTPUT:
// - Json structure with all expense
//

var express = require('express');
var router = express.Router();
var expenseController = require('../controllers/expenseController');

router.post('/getExpense', function(req, res) {
	expenseController.getExpense(req, res);
});

module.exports = router;

