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
// - Json structure with the following data
// - featuredArray[] with all featured images 
//
//
//
//
//

var mongoose = require('mongoose');

exports.getFrontpage = function(req, res) {


	//
    // Receive data from caller
	//
	console.log("###### getFrontpage ######")
	console.log("Data received: " + JSON.stringify(req.body, null, 4));


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
				console.log("findFeatured Result: " + JSON.stringify(data, null, 4));
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
				console.log("findLocation Result: " + JSON.stringify(data, null, 4));
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
				console.log("findNews Result: " + JSON.stringify(data, null, 4));
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
		var todayDate = Math.round(new Date()/1000)
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
				console.log("findHotdeal Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findHotdeal=====")
				resolve(data);
			} else {
				reject(new Error('ERR findHotdeal : ' + err));
			};
		});
    })};



    // 
    // Find all HotDeals
    // 
	var priceController = require('./priceController');
	var priceModel = require('../models/priceModel');
    var priceTable = mongoose.model('priceModel');
	var callPriceController = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START callPriceController=====")
		priceController.getPrice(
		[{ "propertyID": "WAT-606" }]
		,function(err, data) {
			if (!err) {
				console.log("callPriceController Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE callPriceController=====")
				resolve(data);
			} else {
				reject(new Error('ERR callPriceController : ' + err));
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

	// Promise.all([findFeatured(), findLocation(), findNews(), findHotdeal()])
	// .then(findAllPrices)
	// .then(sendResult)

	findFeatured()
		.then(findLocation)
		.then(findNews)
		.then(findHotdeal)
		.then(callPriceController)


		// .then(sendResult)
		// .then(() => Promise.all([findInvoiceSum(), findReceipt()]))
		.catch(err => {
			console.log("getFrontpage ERR: " + err);
			res.json({error:true,err})
		}
	)
}
