// Bank Account Controller
// This Controller will give you data for Bank Account Report
// GET INPUT:
// - List of bank accounts or ALL
// - From and To Date
// OUTPUT:
// - HTML for the Bank Account Report
//

var mongoose = require('mongoose');

exports.getBankAccountReport = function(req, res) {


	//
    // Receive data from caller
	//
	console.log("###### getBankAccountReport ######")
	console.log("Data received: " + JSON.stringify(req.body, null, 4));
	var fromDate = req.body.fromDate;
	var toDate = req.body.toDate;

	//
    // Build the match dynamically for ALL accounts or SPECIFIC accounts 
	//
    if (req.body.bank) {
		var banks = req.body.bank.map(function (obj) {
			return obj._id;
		});
        var matchBank = { 
            $match: { _id: { $in: banks } }
		}
        var matchReceipt = { 
            $match: {
				$and: [
					{ account: { $in: banks } },
					{ paidDate: { $gte: fromDate, $lte: toDate } }
				]					
			}
		}
        var matchExpense = { 
            $match: {
				$and: [
					{ account: { $in: banks } },
					{ dueDate: { $gte: fromDate, $lte: toDate } }
				]					
			}
		}
    } else {
        var matchBank = { 
            $match: {}
		}
        var matchReceipt = { 
            $match: {
				paidDate: { $gte: fromDate, $lte: toDate } 
			}
		}
        var matchExpense = { 
            $match: {
				dueDate: { $gte: fromDate, $lte: toDate } 
			}
		}
    }


    // 
    // Find all bank accounts
    // 
	var bankModel = require('../models/bankModel');
    var bankTable = mongoose.model('bankModel');
	var bankArray = [];
	var findAllBank = function() {
		return new Promise((resolve, reject) => {
		console.log("=====findAllBank=====")
		bankTable.aggregate([
			matchBank,
			],function(err, data) {
			if (!err) {
				bankArray = data;
				console.log("=====RESOLVE findAllBank=====")
				resolve(data);
			} else {
				reject(new Error('findBank ERROR : ' + err));
			};
		});
	})};


    // 
    // Find the RECEIPT for each bank account
    // 
	var receiptModel = require('../models/receiptModel');
    var receiptTable = mongoose.model('receiptModel');
	var receiptArray = [];
	var findAllReceipt = function() {
		return new Promise((resolve, reject) => {
		console.log("=====findAllReceipt=====")
        receiptTable.aggregate([
			matchReceipt,
			{                                               
				$lookup: {                                  
					from: "booking",                        
					localField: "bookingId",                
					foreignField: "_id",	                
					as: "booking"		                
				}	                                        
			},                                              
			{                                               
				$unwind: "$booking"		                
			},                                              
			{                                               
				$lookup: {                                  
					from: "users",                          
					localField: "booking.user",          
					foreignField: "_id",	                
					as: "users"		                        
				}	                                        
			},                                              
			{                                               
				$unwind: "$users"		                    
			},                                              
			{                                               
				$project:{                                  
					"_id" : 1,                              
					"account" : 1,                            
					"paidDate" : 1,                         
					"property" : "$booking.property",          
					"name" : "$users.name",                 
					"receiptNo" : 1,                        
					"amount" : 1                            
				}                                           
			}	                                            
			], function (err, data) {
				if (!err) {
					receiptArray = data;
					console.log("=====RESOLVE findAllReceipt=====")
					resolve(data);
				} else {
					reject(new Error('findReceipts ERROR : ' + err));
				}
		});
	})};


    // 
    // Find the EXPENSE for each bank account
    // 
	var expenseModel = require('../models/expenseModel');
    var expenseTable = mongoose.model('expenseModel');
	var expenseArray = [];
	var findAllExpense = function() {
		return new Promise((resolve, reject) => {
		console.log("=====findAllExpense=====")
        expenseTable.aggregate([
			matchExpense,
			{                                           
				$project:{                              
					"_id" : 0,                          
					"account" : 1,                            
					"dueDate" : 1,                      
					"paidDate" : 1,                      
					"propertyId" : 1,                   
					"expenseCategory" : 1,              
					"text" : 1,                         
					"amount" : 1                        
				}                                       
			}	                                        
			], function (err, data) {
				if (!err) {
					expenseArray = data;
					console.log("=====RESOLVE findAllExpense=====")
					resolve(data);
				} else {
					reject(new Error('findExpense ERROR : ' + err));
				}
		});
	})};


    // 
    // Return the result. 
    // 
	var sendResult = function() {
		return new Promise((resolve, reject) => {
			console.log("=====sendResult=====")
			console.log("receiptArray Result: " + JSON.stringify(receiptArray, null, 4));
			console.log("expenseArray Result: " + JSON.stringify(expenseArray, null, 4));
			res.json({error:false,  "bank":bankArray, "receipt":receiptArray, "expense":expenseArray})
			console.log("=====RESOLVE sendResult=====")
			resolve();
		});
	};


    // 
    // Run the promises
    // 
	findAllBank()
		.then(findAllReceipt)
		.then(findAllExpense)
		.then(sendResult)
		.catch(err => {
			console.error(err);
			console.log("getbankAccountReport ERR: " + err);
			res.json({error:true,err})
		});
}
