// Header Footer Controller
// This Controller will give you data for the header and footer
// GET INPUT:
// - none
// OUTPUT:
// - Json structure with the following data:
// - language[] with all languages 
// - currency[] with all currencies
//
var mongoose = require('mongoose');
exports.getHeaderFooter = function(req, callback) {

	console.log("###### getHeaderFooter ######")
	
    // 
    // Find all Languages
    // 
	var languageModel = require('../models/languageModel');
    var languageTable = mongoose.model('languageModel');
	var findLanguage = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findLanguage=====")
		languageTable.aggregate([
			{                                                   
				$match: {                                       
					active: true 
				}
			},                                                  
			{
				$sort: {
					name:1
				}
			},	
			{                                               
				$project: {
					_id: 1,
					name : 1,
					browserLanguage : 1
				}                                           
			}                                               
		],function(err, data) {
			if (!err) {
				// console.log("findLanguage Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findLanguage=====")
				resolve(data);
			} else {
				reject(new Error('ERR findLanguage : ' + err));
			};
		});
    })};


    // 
    // Find all Currencies
    // 
	var currencyModel = require('../models/currencyModel');
    var currencyTable = mongoose.model('currencyModel');
	var findCurrency = function() {
		return new Promise((resolve, reject) => {
		console.log("=====START findCurrency=====")
		currencyTable.aggregate([
			{                                                   
				$match: {                                       
					active: true 
				}
			},                                                  
			{
				$sort: {
					index: 1
				}
			},	
			{                                               
				$project: {
					_id: 1,
					name : 1,
					symbol : 1
				}                                           
			}                                               
		],function(err, data) {
			if (!err) {
				// console.log("findCurrency Result: " + JSON.stringify(data, null, 4));
				console.log("=====RESOLVE findCurrency=====")
				resolve(data);
			} else {
				reject(new Error('ERR findCurrency : ' + err));
			};
		});
    })};


    // 
    // Run the promises
    // 
	Promise.all([findLanguage(), findCurrency()])
	    .then(res => {
			console.log("### === SEND ALL RESULTS === ###")
			callback( { error:false, language:res[0], currency:res[1] } );
		})
		.catch(err => {
			console.error(err);
			console.log(" headerFooterController: " + err);
			callback( { error:true, err } );
		})
}
