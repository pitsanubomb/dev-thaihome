// Balance Sheet Report Controller
// This Controller will give you data for Property Balance Sheet Report
// GET INPUT:
// - From and To Date
// - Single property
// OUTPUT:
// - Json structure with all balancesheet data
//

var mongoose = require('mongoose');

exports.getBalanceSheet = function(req, res) {


	//
    // Receive data from caller
	//
	console.log("###### getBalanceSheet ######")
	console.log("Data received: " + JSON.stringify(req.body, null, 4));

	// if property is missing
	if (!req.body.propertyID) {
        console.log('propertyID missing in call of getBalanceSheet');
        res.json({error:true, message:'propertyID missing in call of getBalanceSheet'});
        return;
	} else {
	    var propertyID = req.body.propertyID._id;
	}
	
	let tempDate = new Date();
	let firstDay = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
	let lastDay = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);

	// if checkinDate is missing
	if (req.body.fromDate) {
	    var checkinDate = new Date(req.body.fromDate*1000);
	} else {
		var checkinDate = new Date(firstDay);
	}
	
	// if checkoutDate is missing
	if (req.body.toDate) {
	    var checkoutDate = new Date(req.body.toDate*1000);
		if (checkoutDate.getTime() < checkinDate.getTime()) {
			checkoutDate = new Date(lastDay);
		}
	} else {
		var	checkoutDate = new Date(lastDay);
	}

	var checkin = Math.round(new Date(checkinDate.getTime())/1000)
	var checkout = Math.round(new Date(checkoutDate.getTime())/1000)


    // 
    // Find all bookings for the propertyID
    // 
	var balanceSheetModel = require('../models/balanceSheetModel');
    var bookingTable = mongoose.model('balanceSheetModel');
    var findBookings = new Promise(
        (resolve, reject) => {
		bookingTable.aggregate([
			{                                                           
				$match: {                                               
					property: propertyID,                    
					checkin : {$gte: (checkin)}, 
					checkout: {$lte: (checkout)}    
				}                                                       
			},                                                          
			{                                                            
				$lookup: {                                               
					from: "invoice",                                     
					localField: "_id",                                   
					foreignField: "bookingId",	                         
					as: "invoice"		                                 
				}	                                                     
			},                                                           
			{                                                            
				$lookup: {                                               
					from: "receipt",                                     
					localField: "_id",                                   
					foreignField: "bookingId",	                         
					as: "receipt"		                                 
				}	                                                     
			},                                                           
			{                                                            
				$project:{                                               
					"_id" : 1,                                           
					"checkin" : 1,                                       
					"checkout" : 1,                                      
					"invoice" : "$invoice",                              
					"receipt" : "$receipt"                               
				}                                                        
			}                                                            
		], function (err, data) {
			if (!err) {
				resolve(data);
			} else {
				reject(new Error('findBooking ERROR : ' + err));
			};
		});
	});


    // 
    // Find the EXPENSE for the propertyID
    // 
	var expenseModel = require('../models/expenseModel');
    var expenseTable = mongoose.model('expenseModel');
	var findExpense = new Promise(
		(resolve, reject) => {
		expenseTable.aggregate([
			{                                                           
				$match: {                                               
					propertyId: propertyID,
					dueDate: { $gte: checkin, $lte: checkout } 
				}                                                       
			},                                                          
		], function (err, data) {
			if (!err) {
				resolve(data);
			} else {
				reject(new Error('findExpense ERROR : ' + err));
			};
		});
	});


    // 
    // Find all propety sales prices for shared expenses
    // 
	var salesPriceModel = require('../models/salesPriceModel');
    var salesPriceTable = mongoose.model('salesPriceModel');
	var findProperty = new Promise(
		(resolve, reject) => {
		salesPriceTable.aggregate([
			{
				$match:{}
			},
			{
				$project:{ 
					"_id": 1, 
					"saleprice": 1
				}
			}
		],function(err, data) {
			if (!err) {
				resolve(data);
			} else {
				reject(new Error('ERR findPropert : ' + err));
			};
		});
    });


    // 
    // Send the result 
    // 
	var sendResult = function([bookingArray, expenseArray, propertyArray]) {
		return new Promise((resolve, reject) => {
			console.log("=====sendResult=====")
			console.log("bookingArray Result: " + JSON.stringify(bookingArray, null, 4));
			console.log("expenseArray Result: " + JSON.stringify(expenseArray, null, 4));
			console.log("propertyArray Result: " + JSON.stringify(propertyArray, null, 4));
			res.json({error:false,  "booking":bookingArray, "expense":expenseArray, "property":propertyArray})
			console.log("=====RESOLVE sendResult=====")
			resolve();
		});
	};


	//
	// Start the promises
	//
	Promise.all([findBookings, findExpense, findProperty])
		.then(sendResult)
		.catch(err => {
			console.log("getBalanceSheet ERR: " + err);
			res.json({error:true,err})
		}
	)
}
