// Booking Checkin Controller
// This Controller will give you data for Checkin/Checkout today and tomorrow
// GET INPUT:
// - From and To Date
// - Multiple properties or ALL
// - Booking Status
// OUTPUT:
// - Json structure with all booking data
//

var mongoose = require('mongoose');

exports.getBookingCheckin = function(req, res) {


	//
    // Receive data from caller
	//
	console.log("###### getBookingCheckin ######")
	console.log("Data received: " + JSON.stringify(req.body, null, 4));

	// if checkinDate is missing
	var firstDay = new Date();
	if (req.body.fromDate) {
	    var firstDay = new Date(req.body.fromDate*1000);
	}
	var lastDay = new Date(firstDay);
	lastDay.setDate(lastDay.getDate() + 1);
	var secondDay = new Date(lastDay);
	firstDay.setHours(0,0,0,0); // prev midnignt
	secondDay.setHours(0,0,0,0); // prev midnignt
	lastDay.setHours(23,59,59,0); // next midnignt

	console.log("firstDay: " + firstDay)
	console.log("secondDay: " + secondDay)
	console.log("lastDay: " + lastDay)

	var checkin = Math.round(new Date(firstDay.getTime())/1000)
	var checkmid = Math.round(new Date(secondDay.getTime())/1000)
	var checkout = Math.round(new Date(lastDay.getTime())/1000)
	var myMatch = {
		$or:[
			{ checkin: {$gte: checkin, $lte: checkout} },
			{ checkout: {$gte: checkin, $lte: checkout} }
		]
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
	} else {
		myMatch["status"] = { "$lte": 4 };
	}


    // 
    // Find all bookings
    // 
	var bookingListModel = require('../models/bookingListModel');
    var bookingTable = mongoose.model('bookingListModel');
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
					from: "receipt",             
					localField: "_id",           
					foreignField: "bookingId",	 
					as: "receipt"		         
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
				$project:{                                                     
					"_id" : 1,                                                 
					"property" : 1,                             
					"source" : 1,                                              
					"status" : 1,                                              
					"checkin" : 1,                                             
					"checkout" : 1,                                            
					"arrival" : 1,                                            
					"departure" : 1,                                            
					"name" : "$users.name",                                    
					"agent" : "$agent.name",                                   
					"langCode" : "$language.code",                             
					"priceDay" : 1,                                            
					"nights" : 1,                                               
					"discountAmount" : 1,
					"priceSecurity" : 1,                                               
					"sumToPay": {
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
					},
					"paidAlready": {
						"$sum": {
							"$map": {
							"input": "$receipt",
							"as": "re",
							"in": "$$re.amount"
							}
						}
					}
				}                                                         
			}	                                                               
		], function (err, data) {
			if (!err) {
				// console.log("data Result: " + JSON.stringify(data, null, 4));
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
			var checkinTodayArr = [];
			var checkinTomorrowArr = [];
			var checkoutTodayArr = [];
			var checkoutTomorrowArr = [];

			for (var b=0; b<data.length; b++) {

				// if its checkin Today
				if (data[b].checkin >= checkin && data[b].checkin < checkmid) {
					checkinTodayArr.push(data[b]);
				}
				// if its checkin Tomorrow
				if (data[b].checkin >= checkmid && data[b].checkin <= checkout) {
					checkinTomorrowArr.push(data[b]);
				}
				// if its checkout Today
				if (data[b].checkout >= checkin && data[b].checkout < checkmid) {
					checkoutTodayArr.push(data[b]);
				}
				// if its checkout Tomorrow
				if (data[b].checkout >= checkmid && data[b].checkout <= checkout) {
					checkoutTomorrowArr.push(data[b]);
				}

			}
			console.log("checkinTodayArr Result: " + JSON.stringify(checkinTodayArr, null, 4));
			console.log("checkinTomorrowArr Result: " + JSON.stringify(checkinTomorrowArr, null, 4));
			console.log("checkoutTodayArr Result: " + JSON.stringify(checkoutTodayArr, null, 4));
			console.log("checkoutTomorrowArr Result: " + JSON.stringify(checkoutTomorrowArr, null, 4));
			res.json({error:false,  "checkinToday":checkinTodayArr, "checkinTomorrow":checkinTomorrowArr, "checkoutToday":checkoutTodayArr, "checkoutTomorrow":checkoutTomorrowArr})
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
			console.log("getBookingCheckin ERR: " + err);
			res.json({error:true,err})
		}
	)
}

