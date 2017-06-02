// Double Booking Controller
// This Controller will send all Double Bookings
// GET INPUT:
// - Nothing
// OUTPUT:
// - Json structure with all Double Bookings and all Same Day Bookings
// - { doubleBookings: data, sameDayBookings: data}

var mongoose = require('mongoose');

exports.getDoubleBooking = function(req, res) {


	//
    // Receive data from caller
	//
	console.log("###### getDoubleBooking ######")
	console.log("Data received: " + JSON.stringify(req.body, null, 4));

	var checkoutDate = new Date();
	checkoutDate.setHours(23,59,59,0); // next midnignt
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
					checkout: {$gte: checkout},
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
				var allBooking = data;
				var doubleBooking = [];
				var idDouble = "";

				// Loop thru all bookings
				for (var i=0; i<allBooking.length; i++) {	

					var currID        = allBooking[i]._id;
					var currProperty  = allBooking[i].property;
					var currCheckin   = allBooking[i].checkin;
					var currCheckout  = allBooking[i].checkout;

					// console.log('---------START---------')
					// console.log ('currID ' + currID)
					// console.log ('idDouble ' + idDouble.includes(currID))
					// console.log ('currProperty ' + currProperty)
					// console.log ('currCheckin: ' + new Date(currCheckin*1000))
					// console.log ('currCheckout: ' + new Date(currCheckout*1000))
					
					// Find any bookings that overlaps the current bookings checkin/checkout dates
					// find alle bookings hvor:
					//		booking.checkin er større eller ligmed vores current checkin  OG   booking.checkin stadig er minder end vores current checkout   (det betyder nemli at den læste checkin ligger imellem de to currents)
					//		booking.checkout er større eller ligmed vores current checkin  OG   booking.checkout stadig er minder end vores current checkout   (det betyder nemli at den læste checkout ligger imellem de to currents)
					//
					//			--------------[XXXXXXXXXXXXXX]------------- my booking		
					//			---------------[YYYYYYYYYYY]--------------- booking.checkin smaller currIn AND booking.checkout smaller currOut
					//			-------[YYYYYYYYYYYYYYYYYYYYYYYYYY]-------- booking.checkin bigger currIn AND booking.checkout bigger currOut
					//			-------[YYYYYYYYYYY]----------------------- booking.checkout between currIn and currOut
					//			----------------------[YYYYYYYYYYY]-------- booking.checkin between currIn and currOut
					//
				
					// If current is INSIDE period 
					var selectBooking = bookingArray.filter(function(obj){
						return obj.property == currProperty && obj.checkin > currCheckin && obj.checkout < currCheckout
					})
					if (selectBooking.length > 0) {
						console.log('Current is INSIDE period ' + selectBooking.length)
						console.log('currID ' + currID)
						for (var x=0; x<selectBooking.length; x++) {	
							if (currID!=selectBooking[x]._id) {
								if (!idDouble.includes(currID)) {
									idDouble += '|' + currID;
									doubleBooking.push(selectBooking[x]);
								}
							}
						}
						continue;
					}
					
					
					// If current COVERS the whole period
					var selectBooking = bookingArray.filter(function(obj){
						return (obj.checkin < currCheckin && obj.checkout > currCheckout && obj.property == currProperty)
					})
					if (selectBooking.length > 0) {
						console.log('Current COVERS the whole period ' + selectBooking.length)
						console.log('currID ' + currID)
						for (var x=0; x<selectBooking.length; x++) {	
							if (currID!=selectBooking[x]._id) {
								if (!idDouble.includes(currID)) {
									idDouble += '|' + currID;
									doubleBooking.push(selectBooking[x]);
								}
							}
						}
						continue;
					}

					
					// If current is ENDING in period
					var selectBooking = bookingArray.filter(function(obj){
						return (obj.checkin < currCheckin && obj.checkout > currCheckin && obj.property == currProperty)
					})
					if (selectBooking.length > 0) {
						console.log('Current is ENDING in period ' + selectBooking.length)
						console.log('currID ' + currID)
						for (var x=0; x<selectBooking.length; x++) {	
							if (currID!=selectBooking[x]._id) {
								if (!idDouble.includes(currID)) {
									idDouble += '|' + currID;
									doubleBooking.push(selectBooking[x]);
								}
							}
						}
						continue;
					}
					
					// If current is BEGINING in period
					var selectBooking = bookingArray.filter(function(obj){
						return (obj.checkin < currCheckout && obj.checkout > currCheckout && obj.property == currProperty)
					})
					if (selectBooking.length > 0) {
						console.log('Current is BEGINING in period ' + selectBooking.length)
						console.log('currID ' + currID)
						for (var x=0; x<selectBooking.length; x++) {	
							if (currID!=selectBooking[x]._id) {
								if (!idDouble.includes(currID)) {
									idDouble += '|' + currID;
									doubleBooking.push(selectBooking[x]);
								}
							}
						}
						continue;
					}
					
				}
				doubleBooking.sort(function(a, b){
				var nameA=a.property.toLowerCase(), nameB=b.property.toLowerCase();
					if (nameA < nameB) //sort string ascending
					return -1;
					if (nameA > nameB)
					return 1;
					return 0; //default return value (no sorting)
				});
				// console.log("doubleBooking Result: " + JSON.stringify(doubleBooking, null, 4));

				// Find all bookings that has checkin and checkout SAME DAY
				var sameDayBooking = [];
				var idDouble = "";
				for (var i=0; i<allBooking.length; i++) {	

					var currID        = allBooking[i]._id;
					var currProperty  = allBooking[i].property;
					var currCheckin   = allBooking[i].checkin;
					var currCheckout  = allBooking[i].checkout;
					
					// If current is INSIDE period 
					var selectBooking = bookingArray.filter(function(obj){
						return obj.property == currProperty && (obj.checkin == currCheckout || obj.checkout == currCheckin)
					})
					if (selectBooking.length > 0) {
						console.log('SAME DAY ' + selectBooking.length)
						console.log('currID ' + currID)
						for (var x=0; x<selectBooking.length; x++) {	
							if (currID!=selectBooking[x]._id) {
								if (!idDouble.includes(currID)) {
									idDouble += '|' + currID;
									sameDayBooking.push(selectBooking[x]);
								}
							}
						}
						continue;
					}
				}
				//console.log("sameDayBooking Result: " + JSON.stringify(sameDayBooking, null, 4));
				res.json({error:false,  "doubleBooking":doubleBooking, "sameDayBooking":sameDayBooking})
				console.log("=====RESOLVE findDoubleBookings=====")
				resolve(data);
			};
		});
	})};


    // 
    // Run the promises
    // 
	findDoubleBookings()
		.catch(err => {
			console.log("DoubleBooking ERR: " + err);
			res.json({error:true,err})
		}
	)
}

