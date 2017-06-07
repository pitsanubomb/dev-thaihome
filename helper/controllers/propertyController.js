// Property Page Controller
// This Controller will give you data for the Thaihome Property Page
// GET INPUT:
// - PropertyID 
// - checkin date
// - checkout date
// - lc languageCode
// OUTPUT:
// - Json structure with the following data:
// - rating[] with all ratings for the property 
// - property[] with all property/translation/hotdeal data 
//

var mongoose = require('mongoose');

exports.getProperty = function(req, callback) {

	console.log("###### getProperty ######")

    // 
    // Validate the data we get from router 
    // 
	console.log("getProperty received: " + JSON.stringify(req.body, null, 4));
	console.log("property: " +req.body.propertyID);
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

	// console.log("checkin: " +checkin);
	// console.log("checkout: " +checkout);

	// if property is missing
	if (!req.body.propertyID) {
        console.log('propertyID missing in call of getPrice');
        throw new Error('ERR: propertyID missing in call of getPrice');
	} else {
		var propertyID = req.body.propertyID
	}


    // 
    // Find all AVAILABLE properties
    // 
	var propertyModel = require('../models/propertyModel');
    var propertyTable = mongoose.model('propertyModel');
	var findProperty = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findProperty=====")
		propertyTable.aggregate([
		{
			$match: {
				_id: propertyID,
				active : true
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
			$unwind: "$translations.texts"
		},
		{                                               
			$project:{
				"_id" : 1,
				"name" : 1,
				"location" : 1,
				"locationName" : 1,
				"projectName" : 1,

				"propertyType" : 1,
				"unitType" : 1,
				"unitNumber" : 1,
				"bedrooms" : 1,
				"bathrooms" : 1,
				"livingrooms" : 1,

				"address1" : 1,
				"address2" : 1,
				"address3" : 1,
				"thaiAddress" : 1,
				"livingrooms" : 1,
				"gmapslink" : 1,
				"gmapsdata" : 1,

				"minDays" : 1,
				"guestsMin" : 1,
				"guestsMax" : 1,
				"sqm" : 1,
				"ownership" : 1,
				"purchaseprice" : 1,
				"saleprice" : 1,
				"salecommission" : 1,

				"electricUnit" : 1,
				"waterUnit" : 1,
				"cleanprice" : 1,
				"cleanfinalprice" : 1,

				"headline": "$translations.texts.headline",
				"frontpage1": "$translations.texts.frontpage1",
				"frontpage2": "$translations.texts.frontpage2",
				"longtext": "$translations.texts.longtext",
				"house_rules": "$translations.texts.house_rules",
				"beds": "$translations.texts.beds",
				"floor": "$translations.texts.floor",
				"view": "$translations.texts.view",
				"balcony": "$translations.texts.balcony",
				"furnished": "$translations.texts.furnished",
				"kitchen": "$translations.texts.kitchen",
				"beach": "$translations.texts.beach",
				"shopping": "$translations.texts.shopping",
				"nightlife": "$translations.texts.nightlife",
				"maintanance": "$translations.texts.maintanance",

				"featured" : 1,
				"images" : 1,
				"amenities" : 1

			} 
		}                                               
		],function(err, data) {
			if (!err) {
				// console.log("findProperty Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findProperty=====")
				resolve(data);
			} else {
				console.error(err);
				reject(new Error('ERR findProperty : ' + err));
			};
		});
    })};


    // 
    // Find ratings for this property 
    // 
	var ratingModel = require('../models/ratingModel');
    var ratingTable = mongoose.model('ratingModel');
	var findRating = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findRating=====")
		ratingTable.aggregate([
		{                                                   
			$match: {                                       
				property : propertyID
			}
		},
		{ 	$sort: { average: 1 } },
		{                                               
			$project:{
				"_id" : 0,
				"rating" : 1,
				"average" : 1			} 
		}                                               
		],function(err, data) {
            if (!err) {
				// console.log("findRating Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findRating=====");
                resolve(data);
            } else {
				console.error(err);
                reject(new Error('findRating ERROR : ' + err));
            }
		});
	})};


    // 
    // Collect hotdeals for the property
    //
	var collectHotdeals = function([ratingArr, propertyArr]) {
		return Promise.all(propertyArr.map(findHotdeal)).then(propertyArr => {
			return ( [ratingArr, propertyArr] );	
		});
	}; 


    // 
    // Find hotdeals for this property 
    // 
	var hotdealModel = require('../models/hotdealModel');
    var hotdealTable = mongoose.model('hotdealModel');
	var findHotdeal = function(property) {
		return new Promise((resolve, reject) => {
		console.log("=====START findHotdeal=====")
		hotdealTable.aggregate([
		{                                                   
			$match: {                                       
				property : propertyID,
				active : true,
				discount : { $gte: 0 },
				$or: [
					{ start: { $gte: checkin, $lte: checkout } },
					{ end: { $gte: checkin, $lte: checkout } }
				] 
			}
		},
		{ 	$sort: { discount: 1 } },
		{ 	$limit : 1 },
		{                                               
			$project:	{
				_id : 0,
				discount : 1,                            
				text : 1,                                                        
				start : 1,                                                        
				end : 1
			}
		}                                               
		],function(err, data) {
            if (!err) {
				console.log("findHotdeal Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findHotdeal=====");
				property.hotDiscount = data.discount;
				property.hotText = data.text;
				property.hotStart = data.start;
				property.hotEnd = data.end;
				resolve(property); 
            } else {
				console.error(err);
                reject(new Error('findHotdeal ERROR : ' + err));
            }
		});
	})};


    // 
    // Find all Prices for the properties 
    //
	var collectPrices = function([ratingArr, propertyArr]) {
		return Promise.all(propertyArr.map(findPrice)).then(propertyArr => {
			return ( { "rating" : ratingArr, "property" : propertyArr } );	
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
					console.error(err);
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
	Promise.all([findRating(),findProperty()])
	    .then(res => {

			console.log("### === FIND AVAILABLE HOTDEALS === ###")
			collectHotdeals(res).then(res => {

				console.log("### === FIND AVAILABLE PRICES === ###")
				collectPrices(res).then(res => {

					console.log("### === SEND ALL RESULTS === ###")
					callback( { error:false, res } );

				});
	
			});

		})
		.catch(err => {
			console.error(err);
			console.log(" propertyController: " + err);
			callback( { error:true, err } );
		})
}