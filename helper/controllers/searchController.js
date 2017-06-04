// Search Result Page Controller
// This Controller will give you data for the Thaihome Search Result Page
//		all locations from "location" table (jomtien, pattaya, naklua...)
//		all properties that are available in the choosen period with prices and hotdeals
//		all properties that are occupied in the choosen period with prices and hotdeals
// GET INPUT:
// - checkin date
// - checkout date
// OUTPUT:
// - Json structure with the following data:

// - featured[] with all featured images 
// - location[] with all locations
// - news[] with all news
// - hotdeal[] with all hotdeals (including priceNight)
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

	var firstDay = new Date();
	firstDay.setDate(firstDay.getDate() + 30);
	var lastDay = new Date();
	lastDay.setDate(lastDay.getDate() + 37);

	// if checkin is missing
	if (req.body.checkin) {
	    var checkin = new Date(req.body.checkin*1000);
	} else {
		var checkin = new Date(firstDay)
	}
	
	// if checkout is missing
	if (req.body.checkout) {
	    var checkout = new Date(req.body.checkout*1000);
		if (checkout.getTime() < checkin.getTime()) {
			var checkout = new Date(lastDay)
		}
	} else {
		var checkout = new Date(lastDay)
	}

	console.log("checkin: " +checkin);
	console.log("checkout: " +checkout);


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
	var findAvailable = function() {
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
				foreignField: "apartmentID",
				as: "bookings"
			}
		},
		{
			$match: {
				"bookings": {
					$not: {
						$elemMatch: {
							checkin: {
								$lte: 1520000000
							},
							checkout: {
								$gte: 1510000000
							}
						}
					}
				}
			}
		},
		{
			$lookup: {
				from: "translation",
				localField: "_id",
				foreignField: "apartmentID",
				as: "bookings"
			}
		},
	    {
			$project: {
				_id: 0,
				name: 1
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
					"images" : 1,
					"guests" : 1,
					"gmapsdata" : 1,

					"frontpage1" : 1,                            
					"frontpage2" : 1,                            

					"hotDealPct" : 1

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
    // Find all OCCUPIED properties
    // 






    // 
    // Find all News
    // 
	var newsModel = require('../models/newsModel');
    var newsTable = mongoose.model('newsModel');
	var findNews = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findNews=====")
		var todayDate = Math.round(new Date()/1000)
		newsTable.aggregate([
			{                                                   
				$match: {                                       
					start: {$lte: todayDate}, 
					end: { $gte: todayDate}
				}
			},                                                  
			{
				$sort: {
					start:-1
				}
			},	
			{                                               
				$project:{                                  
					"text" : 1                            
				}                                           
			}                                               
		],function(err, data) {
			if (!err) {
				// console.log("findNews Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findNews=====")
				resolve(data);
			} else {
				reject(new Error('ERR findNews : ' + err));
			};
		});
    })};


    // 
    // Find all HotDeals
    // 
	var hotdealModel = require('../models/hotdealModel');
    var hotdealTable = mongoose.model('hotdealModel');
	var findHotdeal = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findHotdeal=====")
		var todayDate = Math.round(new Date()/1000);
		hotdealTable.aggregate([
			{                                                   
				$match: {                                       
					start: {$lte: todayDate}, 
					end: { $gte: todayDate},
					active: true
				}
			},                                                  
			{
				$sort: {
					hot: 1
				}
			},	
			{                                               
				$project:{                                  
					"property" : 1,                            
					"discount" : 1,                            
					"hot" : 1                            
				}                                           
			}                                               
		],function(err, data) {
			if (!err) {
				// console.log("findHotdeal Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findHotdeal=====")
				hotdealArray = data;
				// console.log("findHotdeal Result: " + JSON.stringify(hotdealArray, null, 4));
				resolve(data);
			} else {
				reject(new Error('ERR findHotdeal : ' + err));
			};
		});
    })};


    // 
    // Find all Prices for the AVAILABLE properties 
    //
	var collectAvailablePrices = function([featuredArr, locationArr, newsArr, hotdealArr]) {
		return Promise.all(hotdealArr.map(findPrice)).then(hotdealArr => {
			return ( { "featured":featuredArr, "location":locationArr, "news":newsArr, "hotdeal": hotdealArr } );	
		});
	}; 

    // 
    // Find all Prices for the OCCUPIED properties 
    //
	var collectOccupiedPrices = function([featuredArr, locationArr, newsArr, hotdealArr]) {
		return Promise.all(hotdealArr.map(findPrice)).then(hotdealArr => {
			return ( { "featured":featuredArr, "location":locationArr, "news":newsArr, "hotdeal": hotdealArr } );	
		});
	}; 


    // 
    // Find individual PriceNight and add it to hotdeal.priceNight
    // 
	var priceController = require('./priceController');
	var priceNight = 0;
	var findPrice = function(hotdeal) {
		return new Promise((resolve, reject) => {
	 	console.log ("=====START findPrice: " +hotdeal.property);
		priceController.getPrice (
			{ "body": { "propertyID": hotdeal.property } }, 
			function(result) {
				if (result.error == true) {
					throw new Error(result.err);
				};
				hotdeal.priceNight = result.res.priceNight;
				resolve(hotdeal); 
			}
		);
	 	console.log ("=====RESOLVE findPrice: " +hotdeal.property);
	})}


    // 
    // Run the promises
    // 
	Promise.all([findFeatured(), findLocation(), findNews(), findHotdeal()])
	    .then(res => {

			console.log("### === TIME TO FIND ALL PRICES === ###")
			collectHotDealPrices(res).then(data => {

				console.log("### === SEND ALL RESULTS === ###")
				callback( { error:false, data } );

			});

		})
		.catch(err => {
			console.error(err);
			console.log(" frontpageController: " + err);
			callback( { error:true, err } );
		})
}
