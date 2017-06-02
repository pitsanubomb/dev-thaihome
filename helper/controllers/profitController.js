// Profit and Performance reports Controller
// This Controller will give you data for Profit and Performance reports
// GET INPUT:
// - From and To Date
// - Multiple properties or ALL
// OUTPUT:
// - Json structure with all booking list data
//

var mongoose = require('mongoose');

exports.getProfit = function(req, res) {


	//
    // Receive data from caller
	//
	console.log("###### getProfit ######")
	console.log("Data received: " + JSON.stringify(req.body, null, 4));

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

	var propertyMatch = {
		active: true
	};
	var bookingMatch = {
		checkin: {$gte: checkin},
		checkout: {$lte: checkout}
	};
	if (req.body.hasOwnProperty('propertyID') && req.body.propertyID!='') {
        var properties = req.body.propertyID.map(function (obj) {
            return obj._id;
        });
		propertyMatch["_id"] = { "$in": properties };
		bookingMatch["property"] = { "$in": properties };
	}
	bookingMatch["status"] = { "$lte": 5 };


    // 
    // Find all properties with prices and expenses
    // 
	var profitModel = require('../models/profitModel');
    var profitTable = mongoose.model('profitModel');
	var findProperties = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findProperties=====")
		profitTable.aggregate([ 
			{ "$match": propertyMatch },
			{
				$sort: {
					"_id":1
				}
			},	
			{                                             
				$lookup: {                                
					from: "price",                   
					localField: "_id",                    
					foreignField: "_id",             
					as: "price"                          
				}	                                      
			},                                            
			{                                             
				$unwind: "$price"                        
			}, 
			{                                    
				$lookup: {                       
					from: "expense",             
					localField: "unique",        
					foreignField: "propertyId",	 
					as: "expense"		         
				}	                             
			},
			{                                             
				$project:{                                
					"_id" : 1,                                   
					"name" : 1,                                  
					"sqm" : 1,                                   
					"purchaseprice" : 1,                            
					"saleprice" : 1,                          
					"priceWeek2" :"$price.priceWeek2",          
					"priceYear" :"$price.priceYear",             
					"expense" : "$expense"        
				}                                         
			}                                             
	    ],function(err, data) {
            if (!err) {
				// console.log("findProperties Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findProperties=====")
				resolve(data);
            } else {
                reject(new Error('ERR findProperties : ' + err));
            }
        });
	})};


    // 
    // Find all bookings with invoices and receipts
    // 
	var bookingListModel = require('../models/bookingListModel');
    var bookingTable = mongoose.model('bookingListModel');
	var findBookings = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findBookings=====")
		bookingTable.aggregate([
			{ "$match": bookingMatch },
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
					"property" : 1,                             
					"checkin" : 1,                                             
					"checkout" : 1,                                            
					"source" : 1,                                              
					"status" : 1,                                              
					"priceDay" : 1,                                            
					"nights" : 1,                                               
					"discountAmount" : 1,                                          
					"invoice" : "$invoice", 
					"receipt" : "$receipt"  
				}                                                              
			}	                                                               
		], function (err, data) {
			if (!err) {
				// console.log("findBookings Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findBookings=====")
				resolve(data);
			} else {
				reject(new Error('findBooking ERROR : ' + err));
			};
		});
	})};


    // 
    // Send the result 
    // 
	var sendResult = function([propertyArray, bookingArray]) {
		return new Promise((resolve, reject) => {
			console.log("=====sendResult=====")
			// console.log("bookingArray Result: " + JSON.stringify(bookingArray, null, 4));
			// console.log("propertyArray Result: " + JSON.stringify(propertyArray, null, 4));
			res.json({error:false,  "booking":bookingArray, "property":propertyArray})
			console.log("=====RESOLVE sendResult=====")
			resolve();
		});
	};


    // 
    // Run the promises
    // 
	Promise.all([findProperties(), findBookings()])
		.then(sendResult)
		.catch(err => {
			console.log("getProfit ERR: " + err);
			res.json({error:true,err})
		}
	)
}
