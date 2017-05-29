// Expense Category Route
// This Route will all expense categories
// GET INPUT:
// - none
// OUTPUT:
// - Json structure with all expense categories
//

var express = require('express');
var router = express.Router();
var expenseCategoryController = require('../controllers/expenseCategoryController');

router.get('/getExpenseCategory', function(req, res) {
	expenseCategoryController.getExpenseCategory(req, res);
});

module.exports = router;

