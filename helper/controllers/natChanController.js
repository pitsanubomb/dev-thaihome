// NatCan Report Controller
// This Controller will give you data for NatCan Report
// GET INPUT:
// - From and To Date
// - Multiple properties or ALL
// OUTPUT:
// - Json structure with all NatChan report data
//

var mongoose = require('mongoose');

exports.getNatChan = function(req, res) {


	//
    // Receive data from caller
	//
	console.log("###### getNatChan ######")
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
	myMatch["status"] = { "$lte": 5 };


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
				$lookup: {                                                    
					from: "invoice",                                          
					localField: "_id",                                        
					foreignField: "bookingId",	                              
					as: "invoice"		                                      
				}	                                                          
			},                                                                
			{                                                                  
				$project:{                                                     
					"_id" : 1,                                                
					"source" : 1,                                             
					"status" : 1,                                             
					"checkin" : 1,                                            
					"checkout" : 1,                                           
					"name" : "$users.name",                                   
					"agent" : "$agent.name",                                  
					"agentCommission" : 1,                                    
					"langCode" : "$language.code",                            
					"country" : "$language.country",                          
					"priceDay" : 1,                                           
					"nights" : 1,   
					"discountAmount" : 1,                                          
					"bookingTotal": {
						"$sum": {
							"$map": {
							"input": "$invoice",
							"as": "iv",
							"in": {
								"$sum": {
									"$map": {
									"input": "$$iv.invoiceLines",
									"as": "il",
									"in": "$$il.amountTotal"
									}
								}
							}
							}
						}
					}
				}                                                              
			}	                                                               
		], function (err, data) {
			if (!err) {
				console.log("bookingArray Result: " + JSON.stringify(data, null, 4));
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
	var sendResult = function(data) {
		return new Promise((resolve, reject) => {
			console.log("=====sendResult=====")
			res.json({error:false,  "data":data})
			console.log("=====RESOLVE sendResult=====")
			resolve();
		});
	};


    // 
    // Run the promises
    // 
	findBookings()
		.then(sendResult)
		.catch(err => {
			console.log("getNatChan ERR: " + err);
			res.json({error:true,err})
		}
	)
}

