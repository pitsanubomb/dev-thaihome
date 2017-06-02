// Frontpage Controller
// This Controller will give you data for the Thaihome frontpage
//		all featured images from "featured" table
//		all locations from "location" table (jomtien, pattaya, naklua...)
//		all news from "news" table
//		all hotdeals from "hotdeal" table
//		all prices from "price" table to match hotdeal
// GET INPUT:
// - none
// OUTPUT:
// - Json structure with the following data:
// - featured[] with all featured images 
// - location[] with all locations
// - news[] with all news
// - hotdeal[] with all hotdeals (including prices)
//

// THIS ONE WORKS!!!!!!!!!!!
// THIS ONE WORKS!!!!!!!!!!!
// THIS ONE WORKS!!!!!!!!!!!


var mongoose = require('mongoose');

exports.getFrontpage = function(req, callback) {

	console.log("###### getFrontpage ######")
	var	featuredArray = [];
	var	locationArray = [];
	var	newsArray 	  = [];
	var hotdealArray  = [];

    // 
    // Find all featured images 
    // 
	var featuredModel = require('../models/featuredModel');
    var featuredTable = mongoose.model('featuredModel');
	var findFeatured = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findFeatured=====")
		featuredTable.find({} 
        ,function(err, data) {
            if (!err) {
				// console.log("findFeatured Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findFeatured=====");
                resolve(data);
            } else {
                reject(new Error('findFeatured ERROR : ' + err));
            }
		});
	})};


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
    // Find all Prices for the HotDeals
    //
	var collectHotDealPrices = function([featuredArr, locationArr, newsArr, hotdealArr]) {
		console.log("=====START collectHotDealPrices=====")
		featuredArray = featuredArr;
		locationArray = locationArr;
		newsArray 	  = newsArr;
		hotdealArray  = hotdealArr;
		return Promise.all(hotdealArray.map(findPrice)).then(hotdealArray => {
			console.log("=====RESOLVE collectHotDealPrices=====")
			return ( { "featured":featuredArray, "location":locationArray, "news":newsArray, "hotdeal": hotdealArray } );	
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
				hotdeal.priceNight = result.price.priceNight;
				console.log ("hotdealArray property: " + hotdeal.property);
				console.log ("hotdealArray priceNight: " + hotdeal.priceNight);
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
