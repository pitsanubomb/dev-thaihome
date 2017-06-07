// Search Result Page Controller
// This Controller will give you data for the Thaihome Search Result Page
//		all locations from "location" table (jomtien, pattaya, naklua...)
//		all properties that are available in the choosen period with prices and hotdeals
//		all properties that are occupied in the choosen period with prices and hotdeals
// GET INPUT:
// - checkin date
// - checkout date
// - lc languageCode
// OUTPUT:
// - Json structure with the following data:
// - location[] with all locations
// - available[] with all available properties
// - occupied[] with all occupied properties
//

var mongoose = require('mongoose');

exports.getSearch = function(req, callback) {

	console.log("###### getSearch ######")

    // 
    // Validate the data we get from router
    // 
	console.log("getSearch received: " + JSON.stringify(req.body, null, 4));
	console.log("checkin: " +req.body.checkin);
	console.log("checkout: " +req.body.checkout);
	console.log("languagecode: " +req.body.lc);

	var languageCode = 	req.body.lc ? req.body.lc : "gb"; 

	var firstDay = new Date();
	firstDay.setDate(firstDay.getDate() + 30);
	var lastDay = new Date();
	lastDay.setDate(lastDay.getDate() + 37);

	// if checkin is missing
	if (req.body.checkin) {
	    var checkinDate = new Date(req.body.checkin*1000);
	} else {
		var checkinDate = new Date(firstDay)
	}
	
	// if checkout is missing
	if (req.body.checkout) {
	    var checkoutDate = new Date(req.body.checkout*1000);
		if (checkoutDate.getTime() < checkinDate.getTime()) {
			var checkoutDate = new Date(lastDay)
		}
	} else {
		var checkoutDate = new Date(lastDay)
	}

	var checkin  = Math.round(new Date(checkinDate.getTime())/1000)
	var checkout = Math.round(new Date(checkoutDate.getTime())/1000)

	console.log("checkin: " +checkin);
	console.log("checkout: " +checkout);

    // Build match to find available units 
	var availableMatch = {
		"bookings": {
			$not: {
				$elemMatch: {
					checkin: { $lte: checkout },
					checkout: { $gte: checkin }
				}
			}
		}
	};

    // Build match to find occupied units 
	var occupiedMatch = {
		"bookings": {
			$elemMatch: {
				checkin: { $lte: checkout },
				checkout: { $gte: checkin }
			}
		}
	};


    // 
    // Find all locations in Pattaya 
    // 
	var locationModel = require('../models/locationModel');
    var locationTable = mongoose.model('locationModel');
	var findLocation = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findLocation=====")
		locationTable.find({} 
        ,function(err, data) {
            if (!err) {
				// console.log("findLocation Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findLocation=====");
                resolve(data);
            } else {
                reject(new Error('findLocation ERROR : ' + err));
            }
		});
	})};


    // 
    // Find all AVAILABLE properties
    // 
	var propertyModel = require('../models/propertyModel');
    var propertyTable = mongoose.model('propertyModel');
	var findAvailable = function(myMatch) {
		return new Promise((resolve, reject) => {
		console.log("=====START findAvailable=====")
		propertyTable.aggregate([
		{                                                   
			$match: {                                       
				active : true
			}
		},                                                  
		{
			$lookup: {
				from: "booking",
				localField: "_id",
				foreignField: "property",
				as: "bookings"
			}
		},
		{
			$match: myMatch
		},
		{
			$lookup: {
				from: "hotdeal",
				localField: "_id",
				foreignField: "property",
				as: "hotdeals"
			}
		},
		{                                                   
			$match: {                                       
				"hotdeals.active": true,
				"hotdeals.start": { $lte: checkout },
				"hotdeals.end": { $gte: checkin }
			}
		},
		{ 
			$unwind: { 
				path: "$hotdeals", preserveNullAndEmptyArrays: true
			}
		}, 
		{
			$lookup: {
				from: "translation",
				localField: "_id",
				foreignField: "property",
				as: "translations"
			}
		},
		{
			$unwind: { 
				path: '$translations', preserveNullAndEmptyArrays: true
			}
		},
		{                                                   
			$match: {                                       
				"translations.language": languageCode
			}
		},
		{                                               
			$project:{
				"_id" : 1,                                 
				"name" : 1,
				"location" : 1,
				"languageCode" : 1,
				"locationName" : 1,
				"projectName" : 1,
				"featured" : 1,
				"images" : 1,
				"guests" : 1,
				"gmapsdata" : 1,

				"hot" : "$hotdeals.hot",                            
				"discount" : "$hotdeals.discount",                            
				"text" : "$hotdeals.text",                                                        
				"start" : "$hotdeals.start",                                                        
				"end" : "$hotdeals.end",                                                        

				"frontpage1": "$translations.frontpage1",
				"frontpage2": "$translations.frontpage2"
			} 
		}                                               
		],function(err, data) {
			if (!err) {
				// console.log("findAvailable Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findAvailable=====")
				resolve(data);
			} else {
				reject(new Error('ERR findAvailable : ' + err));
			};
		});
    })};


    // 
    // Find all Prices for the properties 
    //
	var collectAvailablePrices = function([locationArr, availableArr, occupiedArr]) {
		return Promise.all(availableArr.map(findPrice)).then(availableArr => {
			return ( [locationArr, availableArr, occupiedArr] );	
		});
	}; 
	var collectOccupiedPrices = function([locationArr, availableArr, occupiedArr]) {
		return Promise.all(occupiedArr.map(findPrice)).then(occupiedArr => {
			return ( { "location":locationArr, "available": availableArr , "occupied": occupiedArr } );	
		});
	}; 


    // 
    // Find individual PriceNight and add it to property.priceNight
    // 
	var priceController = require('./priceController');
	var priceNight = 0;
	var findPrice = function(property) {
		return new Promise((resolve, reject) => {
	 	console.log ("=====START findPrice: " +property._id);
		priceController.getPrice (
			{ "body": { "propertyID": property._id, "checkin": checkin, "checkout": checkout } }, 
			function(result) {
				if (result.error == true) {
					throw new Error(result.err);
				};
				// console.log("PRICE: " + JSON.stringify(result, null, 4));
				property.priceNight = result.res.priceNight;
				property.priceTotal = result.res.priceTotal;
				property.nights = result.res.nights;
				resolve(property); 
			}
		);
	 	console.log ("=====RESOLVE findPrice: " +property._id);
	})}


    // 
    // Run the promises
    // 
	Promise.all([findLocation(), findAvailable(availableMatch), findAvailable(occupiedMatch)])
	    .then(res => {

			console.log("### === FIND AVAILABLE PRICES === ###")
			collectAvailablePrices(res).then(res => {

				console.log("### === FIND OCCUPIED PRICES === ###")
				collectOccupiedPrices(res).then(res => {

					console.log("### === SEND ALL RESULTS === ###")
					callback( { error:false, res } );

				});

			});

		})
		.catch(err => {
			console.error(err);
			console.log(" searchController: " + err);
			callback( { error:true, err } );
		})
}
