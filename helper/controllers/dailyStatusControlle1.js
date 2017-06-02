// Daily Status Report Controller
// This Controller will give you data for Daily Status Report
// GET INPUT:
// - From Date
// OUTPUT:
// - Json structure with all Daily Status Report data
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
	    var checkinDate = new Date(req.body.fromDate*1000);
	} else {
		var checkinDate = new Date();
	}
	checkinDate.setHours(0,0,0,0); // last midnight
	var checkoutDate = new Date(checkinDate);
	checkoutDate.setHours(23,59,59,0); // next midnignt
	var checkin = Math.round(new Date(checkinDate.getTime())/1000)
	var checkout = Math.round(new Date(checkoutDate.getTime())/1000)


	//
    // Find all bookings for Double and Same Day bookings
	// All bookings where booking.checkout is > today at 00:00:00
	//
	var bookingListModel = require('../models/bookingListModel');
    var bookingTable = mongoose.model('bookingListModel');
	var bookingArray = [];
	var findDoubleBookings = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findDoubleBookings=====")
		bookingTable.aggregate([
			{ 
				$match: {
					checkout: {$gte: checkin},
					status: {$lte: 3}
				}
			},
			{
				$sort: {
					"checkin":1
				}
			},	
			{                                                                  
				$lookup: {                                                     
					from: "users",                                             
					localField: "user",                                        
					foreignField: "_id",	                                   
					as: "users"		                                           
				}	                                                           
			},                                                                 
			{                                                                  
				$unwind: "$users"		                                       
			},                                                                 
			{                                                                  
				$lookup: {                                                     
					from: "languagecodes",                                     
					localField: "users.country",                               
					foreignField: "country",	                               
					as: "language"		                                       
				}	                                                           
			},                                                                 
			{                                                                  
				$unwind: "$language"		                                   
			},                                                                 
			{                                                                  
				$lookup: {                                                     
					from: "users",                                             
					localField: "agent",                                       
					foreignField: "_id",	                                   
					as: "agent"		                                           
				}	                                                           
			},	                                                               
			{                                                                  
				$unwind: { path: "$agent", preserveNullAndEmptyArrays: true }  
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
					"property" : 1,                             
					"source" : 1,                                              
					"status" : 1,                                              
					"checkin" : 1,                                             
					"checkout" : 1,                                            
					"name" : "$users.name",                                    
					"agent" : "$agent.name",                                   
					"langCode" : "$language.code",                             
					"priceDay" : 1,                                            
					"nights" : 1,                                               
					"discountAmount" : 1,                                          
					"paidAlready": {
						"$sum": {
							"$map": {
							"input": "$receipt",
							"as": "iv",
							"in": "$$iv.amount"
							}
						}
					}
				}                                                              
			}	                                                               
		], function (err, data) {
			if (err) {
				reject(new Error('findBooking ERROR : ' + err));
			} else {
				// console.log("bookingArray Result: " + JSON.stringify(data, null, 4));
				bookingArray = data;
				console.log("=====RESOLVE findDoubleBookings=====")
				resolve(data);
			};
		});
	})};



	//
    // Create the match string
	//
	var myMatch = {
		checkin: {$gte: checkin},
		checkout: {$lte: checkout}
	};
	if (req.body.hasOwnProperty('propertyID') && req.body.propertyID!='') {
        var properties = req.body.propertyID.map(function (obj) {
            return obj._id;
        });
		console.log("properties: " + properties); 
		myMatch["property"] = { "$in": properties };
	}
	if (req.body.status=="ACTIVE" || req.body.status=="NOPAY") {
		myMatch["status"] = { "$lte": 4 };
	} else if (req.body.hasOwnProperty('status') && req.body.status!="ALL") {
		myMatch["status"] = +req.body.status;
	}









    // 
    // Find all bookings
    // 
	var bookingListModel = require('../models/bookingListModel');
    var bookingTable = mongoose.model('bookingListModel');
	var bookingID = [];
	var bookingArray = [];
	var findBookings = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findBookings=====")
		bookingTable.aggregate([
			{ "$match": myMatch },
			{                                                                  
				$lookup: {                                                     
					from: "users",                                             
					localField: "user",                                        
					foreignField: "_id",	                                   
					as: "users"		                                           
				}	                                                           
			},                                                                 
			{                                                                  
				$unwind: "$users"		                                       
			},                                                                 
			{                                                                  
				$lookup: {                                                     
					from: "languagecodes",                                     
					localField: "users.country",                               
					foreignField: "country",	                               
					as: "language"		                                       
				}	                                                           
			},                                                                 
			{                                                                  
				$unwind: "$language"		                                   
			},                                                                 
			{                                                                  
				$lookup: {                                                     
					from: "users",                                             
					localField: "agent",                                       
					foreignField: "_id",	                                   
					as: "agent"		                                           
				}	                                                           
			},	                                                               
			{                                                                  
				$unwind: { path: "$agent", preserveNullAndEmptyArrays: true }  
			},                                                                 
			{                                                                  
				$project:{                                                     
					"_id" : 1,                                                 
					"property" : 1,                             
					"source" : 1,                                              
					"status" : 1,                                              
					"checkin" : 1,                                             
					"checkout" : 1,                                            
					"name" : "$users.name",                                    
					"agent" : "$agent.name",                                   
					"langCode" : "$language.code",                             
					"priceDay" : 1,                                            
					"nights" : 1,                                               
					"discountAmount" : 1,                                          
				}                                                              
			}	                                                               
		], function (err, data) {
			if (!err) {
				bookingArray = data;
				bookingID = bookingArray.map(function (obj) {
					return obj._id;
				});
				console.log("bookingArray Result: " + JSON.stringify(bookingArray, null, 4));
				console.log("bookingID Result: " + JSON.stringify(bookingID, null, 4));
				console.log("=====RESOLVE findBookings=====")
				resolve(data);
			} else {
				reject(new Error('findBooking ERROR : ' + err));
			};
		});
	})};


    // 
    // Find all invoices
    // 
	var invoiceSumModel = require('../models/invoiceSumModel');
    var invoiceSumTable = mongoose.model('invoiceSumModel');
	var findInvoiceSum = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findInvoiceSum=====")
		invoiceSumTable.aggregate([
			{                                                   
				$match: {                                       
					 bookingId: { $in: bookingID } 
				}
			},                                                  
			{                                                   
				$unwind: "$invoiceLines"		                
			},                                                  
			{                                                   
				$group: {                                       
					_id: "$_id",                                
					sum: {$sum: "$invoiceLines.amountTotal"},   
					bookingId: { $first: "$bookingId" },
					dueDate: { $first: "$dueDate" }			    
				}                                               
			},                                                  
			{                                                   
				$project:{                                      
					"_id" : 1,                                  
					"bookingId" : 1,                                  
					"dueDate" : 1,                              
					"sum" : 1                                   
				}                                               
			}                                                   
		], function (err, data) {
			if (!err) {
				console.log("=====RESOLVE findInvoiceSum=====")
				resolve(data);
			} else {
				reject(new Error('findExpense ERROR : ' + err));
			};
		});
	})};


    // 
    // Find all preceipts
    // 
	var receiptModel = require('../models/receiptModel');
    var receiptTable = mongoose.model('receiptModel');
	var findReceipt = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findReceipt=====")
		receiptTable.aggregate([
			{                                                   
				$match: {                                       
					 bookingId: { $in: bookingID } 
				}
			},                                                  
			{                                               
				$project:{                                  
					"_id" : 1,                              
					"bookingId" : 1,                                  
					"amount" : 1                            
				}                                           
			}                                               
		],function(err, data) {
			if (!err) {
				console.log("=====RESOLVE findReceipt=====")
				resolve(data);
			} else {
				reject(new Error('ERR findPropert : ' + err));
			};
		});
    })};


    // 
    // Send the result 
    // 
	var sendResult = function([invoiceArray, receiptArray]) {
		return new Promise((resolve, reject) => {
			console.log("=====sendResult=====")
			console.log("bookingArray Result: " + JSON.stringify(bookingArray, null, 4));
			console.log("invoiceArray Result: " + JSON.stringify(invoiceArray, null, 4));
			console.log("receiptArray Result: " + JSON.stringify(receiptArray, null, 4));
			res.json({error:false,  "booking":bookingArray, "invoice":invoiceArray, "receipt":receiptArray})
			console.log("=====RESOLVE sendResult=====")
			resolve();
		});
	};


    // 
    // Run the promises
    // 
	findDoubleBookings()
		// .then(() => Promise.all([findInvoiceSum(), findReceipt()]))
		// .then(sendResult)
		.catch(err => {
			console.log("getStatus ERR: " + err);
			res.json({error:true,err})
		}
	)
}

