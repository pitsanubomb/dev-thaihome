// Expense Report Controller
// This Controller will give you data for Expense Report
// GET INPUT:
// - List of expense categories or ALL
// OUTPUT:
// - Json structure with all expense
//

var mongoose = require('mongoose');

exports.getExpense = function(req, res) {


	//
    // Receive data from caller
	//
	console.log("###### getExpense ######")
	console.log("Data received: " + JSON.stringify(req.body, null, 4));


	//
    // Build the match dynamically for 
	//	  ALL expenseCategory or SPECIFIC expenseCategory 
	//	  ALL propertyID or SPECIFIC propertyID 
	//
	if (req.body.expenseCategory) {
		var categories = req.body.expenseCategory.map(function (obj) {
			return obj._id;
		});
    }
    if (req.body.propertyID) {
        var properties = req.body.propertyID.map(function (obj) {
            return obj._id;
        });
    }
	if (req.body.expenseCategory && req.body.propertyID) {
        var matchExpense = { 
            $match: {
				$and: [
					{ propertyId: { $in: properties } },
					{ expenseCategory: { $in: categories }  }
				]					
			}
		}
	} else if (req.body.expenseCategory) {
        var matchExpense = { 
            $match: {
				expenseCategory: { $in: categories }
			}
		}
	} else if (req.body.propertyID) {
        var matchExpense = { 
            $match: {
				propertyId: { $in: properties }
			}
		}
    } else {
        var matchExpense = { 
            $match: {}
		}
    }


    // 
    // Find the EXPENSE for each bank account
    // 
	var expenseModel = require('../models/expenseModel');
    var expenseTable = mongoose.model('expenseModel');
	expenseTable.aggregate([
		matchExpense                              
		], function (err, data) {
			if (!err) {
	            res.json({error:false,data:data});
			} else {
	            res.json({error:true,message:"ERR getExpense: " + err});
			}
	});

}
