// Finance Status Controller
// This Controller will give you data for this months financials
// GET INPUT:
// - From Date To Date
// OUTPUT:
// - Json structure with all financial data
//

var mongoose = require('mongoose');

exports.getStatus = function(req, res) {


	//
    // Receive data from caller
	//
	console.log("###### getStatus ######")
	console.log("Data received: " + JSON.stringify(req.body, null, 4));

	// if checkinDate is missing
	if (req.body.fromDate) {
	    var tempDate = new Date(req.body.fromDate*1000);
	} else {
		var tempDate = new Date();
	}
	let firstDay = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
	firstDay.setHours(0,0,0,0); 
	let lastDay = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);
	lastDay.setHours(23,59,59,0); 
	var checkin = Math.round(new Date(firstDay.getTime())/1000)
	var checkout = Math.round(new Date(lastDay.getTime())/1000)

	//
	// Sum up all receipts for this month and put into totalReceipts
	//
	var receiptModel = require('../models/receiptModel');
    var receiptTable = mongoose.model('receiptModel');
	var totalReceipts = 0;
	var findAllReceipt = function() {
		return new Promise((resolve, reject) => {
		console.log("=====findAllReceipt=====")
        receiptTable.aggregate(
			{                                                 
				$match: {                                     
					paidDate: {$gte: checkin, $lte: checkout}        
				}                                             
			},                                                
			{                                                 
				$group: {                                     
					_id : null, totalReceipts : { $sum: "$amount" }     
				}                                             
			},                                                
			{                                                 
				$project: {                                   
					_id: 0, totalReceipts: 1                            
				}                                             
			}                                                 
		, function (err, data) {
			if (err) {
				reject(new Error('findAllReceipt ERROR : ' + err));
			} else {
				console.log("findAllReceipt Result: " + JSON.stringify(data, null, 4));
				console.log("findAllReceipt Result: " + JSON.stringify(data[0].totalReceipts, null, 4));
				if (data[0].hasOwnProperty("totalReceipts")) {
					totalReceipts = data[0].totalReceipts;
				}
				console.log("Receipt Sum: " + totalReceipts)
				console.log("=====RESOLVE findAllReceipt=====")
				resolve(data);
			};
		});
	})};


    // 
    // Sum up all expenses for this month and put into totalExpenses
    // 
	var expenseModel = require('../models/expenseModel');
    var expenseTable = mongoose.model('expenseModel');
	var totalExpenses = 0;
	var findAllExpense = function() {
		return new Promise((resolve, reject) => {
		console.log("=====findAllExpense=====")
		expenseTable.aggregate(
			{                                                 
				$match: {                                     
					dueDate: {$gte: checkin, $lte: checkout}        
				}                                             
			},                                                
			{                                                 
				$group: {                                     
					_id : null, totalExpenses : { $sum: "$amount" }     
				}                                             
			},                                                
			{                                                 
				$project: {                                   
					_id: 0, totalExpenses: 1                            
				}                                             
			}                                                 
		, function (err, data) {
			if (err) {
				reject(new Error('findAllExpense ERROR : ' + err));
			} else {
				console.log("totalExpenses Result: " + JSON.stringify(data, null, 4));
				if (data[0].hasOwnProperty("totalExpenses")) {
					totalExpenses = data[0].totalExpenses;
				}
				console.log("Expense Sum: " + totalExpenses)
				console.log("=====RESOLVE findAllExpense=====")
				resolve(data);
			};
		});
	})};


    // 
    // Sum up all PAID expenses for this month and put into totalExpensesPaid
    // 
	var expenseModel = require('../models/expenseModel');
    var expenseTable = mongoose.model('expenseModel');
	var totalExpensesPaid = 0;
	var findAllExpensePaid = function() {
		return new Promise((resolve, reject) => {
		console.log("=====findAllExpensePaid=====")
		expenseTable.aggregate(
			{                                                 
				$match: {                                     
					dueDate: {$gte: checkin, $lte: checkout},        
					paidDate: {$gte: 1451606400},     
				}                                             
			},                                                
			{                                                 
				$group: {                                     
					_id : null, totalExpensesPaid : { $sum: "$amount" }     
				}                                             
			},                                                
			{                                                 
				$project: {                                   
					_id: 0, totalExpensesPaid: 1                            
				}                                             
			}                                                 
		, function (err, data) {
			if (err) {
				reject(new Error('findAllExpensePaid ERROR : ' + err));
			} else {
				console.log("findAllExpensePaid Result: " + JSON.stringify(data, null, 4));
				if (data[0].hasOwnProperty("totalExpensesPaid")) {
					totalExpensesPaid = data[0].totalExpensesPaid;
				}
				console.log("Expense Sum: " + totalExpensesPaid)
				console.log("=====RESOLVE findAllExpensePaid=====")
				resolve(data);
			};
		});
	})};


	//
	// Sum all invoices within Date (status from NEW to CHECKOUT) and put into totalInvoice
	//
	var invoiceModel = require('../models/invoiceModel');
    var invoiceTable = mongoose.model('invoiceModel');
	var totalInvoice = 0;
	var findAllInvoice = function() {
		return new Promise((resolve, reject) => {
		console.log("=====findAllInvoice=====")
        invoiceTable.aggregate(
			{                                                 
				$match: {                                     
					dueDate: {$gte: checkin, $lte: checkout}        
				}                                             
			},                                                
			{                                  
				$lookup: {                     
					from: "booking",           
					localField: "bookingId",   
					foreignField: "_id",       
					as: "booking"              
				}                              
			},
			{                                              
				$match: {                                  
					"booking.status": {$lt: 5},            
															
				}                                           
			},                                             
			{                                               
				$unwind: "$invoiceLines"		            
			},                                              
			{ $group:
				{ 
					_id: null, 
					totalInvoice: { '$sum': '$invoiceLines.amountTotal' }
				}
			},				
			{                                                 
				$project: {                                   
					_id: 0, totalInvoice: 1                            
				}                                             
			}                                                 
		, function (err, data) {
			if (err) {
				reject(new Error('findAllInvoice ERROR : ' + err));
			} else {
				console.log("findAllInvoice Result: " + JSON.stringify(data, null, 4));
				console.log("hasOwnProperty Result: " + data[0].hasOwnProperty("totalInvoice"));
				if (data[0].hasOwnProperty("totalInvoice")) {
					totalInvoice = data[0].totalInvoice;
				}
				console.log("invoice Sum: " + totalInvoice)
				console.log("=====RESOLVE findAllInvoice=====")
				resolve(data);
			};
		});
	})};


	//
	// Find all bookings for this month and put into monthBooking
	//
	var bookingListModel = require('../models/bookingListModel');
    var bookingTable = mongoose.model('bookingListModel');
	var bookingArray = [];
	var totalBookings = 0;
	var totalDays = 0;
	var findMonthBookings = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findMonthBookings=====")
		bookingTable.aggregate([
		{                                                                                             
			$match: {                                                                                         
				$and:                                                                                  
				[                                                                                      
					{ status: {$lt:6} },                                                               
					{                                                                                  
					$or:                                                                               
					[                                                                                  
						{ checkin: {$gte: checkin},  checkout: {$lte: checkout} },   
						{ checkin: {$lt:  checkin},  checkout: {$gt:  checkout} },   
						{ checkin: {$lt:  checkin},  checkout: {$gt:  checkin}  }, 
						{ checkin: {$lt:  checkout}, checkout: {$gt:  checkout} }      
					]                                                                                  
					}                                                                                  
				]                                                                                      
			}                                                                                          
		},                                                                                            
		{                                                                                             
			$project:{                                                                                
				"_id" : 0,                                                                            
				"checkin" : 1,                                                                        
				"checkout" : 1                                                                        
			}                                                                                         
		}                                                                                             
		], function (err, data) {
			if (err) {
				reject(new Error('findMonthBookings ERROR : ' + err));
			} else {
				// console.log("bookingArray Result: " + JSON.stringify(data, null, 4));
				if (data) {
					monthBooking = data;
				}
				console.log("monthBooking Result: " + JSON.stringify(monthBooking, null, 4));

				// If booking is INSIDE this month 
				var selectBooking = monthBooking.filter(function(obj){
					return (obj.checkin >= checkin && obj.checkout <= checkout)
				})
				for (var b=0; b<selectBooking.length; b++) {	
					totalBookings++;
					totalDays += daysBetween(new Date(selectBooking[b].checkin*1000),new Date(selectBooking[b].checkout*1000))
				}
				
				// If booking COVERS the whole month
				var selectBooking = monthBooking.filter(function(obj){
					return (obj.checkin < checkin && obj.checkout > checkout)
				})
				for (var b=0; b<selectBooking.length; b++) {	
					totalBookings++;
					totalDays += daysBetween(new Date(checkin*1000),new Date(checkout*1000))
				}
				
				// If booking is ENDING in this month
				var selectBooking = monthBooking.filter(function(obj){
					return (obj.checkin < checkin && obj.checkout > checkin)
				})
				for (var b=0; b<selectBooking.length; b++) {	
					totalBookings++;
					totalDays += daysBetween(new Date(checkin*1000),new Date(selectBooking[b].checkout*1000))
				}
				
				// If booking is BEGINING in this month
				var selectBooking = monthBooking.filter(function(obj){
					return (obj.checkin < checkout && obj.checkout > checkout)
				})
				for (var b=0; b<selectBooking.length; b++) {	
					totalBookings++;
					totalDays += daysBetween(new Date(selectBooking[b].checkin*1000),new Date(checkout*1000))
				}

				console.log("=====RESOLVE findMonthBookings=====")
				resolve(data);
			};
		});
	})};


	//
	// Find all bookings for this month and put into monthBooking
	//
    var propertyIdListModel = require('../models/propertyIdListModel');
    var propertyTable = mongoose.model('propertyIdListModel');
	var totalProperties = 0;
	var maxDays = 0;
	var countProperties = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START countProperties=====")
		propertyTable.aggregate (
			{
				$match:{ "active": true }
			},
			{	
				$group: { _id: null, count: { $sum: 1 } } 
			}
		, function (err, data) {
			if (err) {
				reject(new Error('countProperties ERROR : ' + err));
			} else {
				console.log("countProperties Result: " + JSON.stringify(data, null, 4));
				if (data) {
					totalProperties = data[0].count;
					maxDays = totalProperties * new Date(checkout*1000).getDate();
				}
				console.log("totalProperties: " + totalProperties)
				console.log("maxDays: " + maxDays)
				console.log("=====RESOLVE countProperties=====")
				resolve(data);
			};
		});
	})};

    // 
    // Send the result 
    // 
	var sendResult = function(data) {
		return new Promise((resolve, reject) => {
			console.log("=====sendResult=====")
			res.json({
				error: false,  
				"date":				checkin,
				"moneyIn":			totalReceipts,
				"moneyOut":			totalExpenses,
				"profit":			(totalReceipts-totalExpenses),
				"invoicePaid":		totalReceipts,
				"invoiceNotPaid":	(totalInvoice-totalReceipts),
				"expensesPaid":		totalExpensesPaid,
				"expensesNotPaid":	(totalExpenses-totalExpensesPaid),
				"estimateProfit":	(totalInvoice-totalExpenses),
				"bookings":			totalBookings,
				"daysBooked":		totalDays,
				"daysMax":			maxDays,
				"occupancy":		((totalDays/maxDays)*100).toFixed(1)
			})
			console.log("=====RESOLVE sendResult=====")
			resolve();
		});
	};


    // 
    // Run the promises
    // 
	// findAllReceipt()
	// 	.then(findAllExpense)
	// 	.then(findAllExpensePaid)
	// 	.then(findAllInvoice)
	// 	.then(findMonthBookings)
	// 	.then(countProperties)
	Promise.all([findAllReceipt(), findAllExpense(), findAllExpensePaid(), findAllInvoice(), findMonthBookings(), countProperties()])
		.then(sendResult)
		.catch(err => {
			console.log("getStatus ERR: " + err);
			res.json({error:true,err})
		}
	)


	// Calculate amount of DAYS between two dates
	var daysBetween = function (date1, date2) {
		var ONE_DAY = 1000 * 60 * 60 * 24
		var date1_ms = date1.getTime()
		var date2_ms = date2.getTime()
		var difference_ms = Math.abs(date1_ms - date2_ms)
		return Math.round(difference_ms/ONE_DAY)
	}


}

