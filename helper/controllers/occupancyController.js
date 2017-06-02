// Occupancy Report Controller
// This Controller will give you data for Occupancy Report
// GET INPUT:
// - From and To Date
// - Multiple properties or ALL
// OUTPUT:
// - Json structure with all Occupancy data
//

var mongoose = require('mongoose');

exports.getOccupancy = function(req, res) {

	//
    // Receive data from caller
	//
	console.log("###### getOccupancy ######")
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
		checkout: {$lte: checkout},
		status: {$lte: 5}
	};
	if (req.body.hasOwnProperty('propertyID') && req.body.propertyID!='') {
        var properties = req.body.propertyID.map(function (obj) {
            return obj._id;
        });
		myMatch["property"] = { "$in": properties };
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
					from: "property",                                             
					localField: "property",                                        
					foreignField: "_id",	                                   
					as: "property"		                                           
				}	                                                           
			},                                                                 
			{                                                                  
				$unwind: "$property"		                                   
			},                                                                 
			{                                                                  
				$project:{                                                     
					"_id" : 1,                                                 
					"status" : 1,                                              
					"property" : "$property._id",                             
					"checkin" : 1,                                             
					"checkout" : 1,                                            
					"name" : "$property.name"
				}                                                              
			}	                                                               
		], function (err, data) {
			if (!err) {
				bookingArray = data;
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
	var sendResult = function() {
		return new Promise((resolve, reject) => {
			console.log("=====sendResult=====")
			console.log("bookingArray Result: " + JSON.stringify(bookingArray, null, 4));
			res.json({error:false, "booking":bookingArray})
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
			console.log("getOccupancy ERR: " + err);
			res.json({error:true,err})
		}
	)
}

