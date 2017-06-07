// Agent Rent Route
// This Route will give you data for Agent Rent Report
// GET INPUT:
// - List of property ID's or ALL
// OUTPUT:
// - Json structure with all data for the Agent Rent Report
//

var mongoose = require('mongoose');

exports.getAgentRentReport = function(req, res){

	//
    // Receive data from caller
	//
	console.log("###### getAgentRentReport ######")
	console.log("Data received: " + JSON.stringify(req.body, null, 4));


	//
    // Build the match dynamically 
	//
    if (req.body.propertyID) {
		var properties = req.body.propertyID.map(function (obj) {
            return obj._id;
        });
		var unixToday = Math.round(new Date().getTime()/1000);
        var matchStr = { 
            $match: {
                $and: 
                [{ 
                    _id: { $in: properties },
                    active : true
                }]
            }
        }
		var matchBooking = { 
            $match: {
                $and: 
                [{ 
                    property: { $in: properties },
					checkout: {$gt: unixToday}
                }]
            }
        }
    } else {
        var matchStr = { 
            $match: {
                    active : true
            }
        }
		var matchBooking = { 
            $match: {
					checkout: {$gt: unixToday}
            }
        }
    }


    // 
	// Promise to get properties
    // 
	var agentRentModel = require('../models/agentRentModel');
    var agentRentTable = mongoose.model('agentRentModel');
    var findProperties = new Promise(
        (resolve, reject) => {
		agentRentModel.aggregate([ matchStr,
			{
				$sort: {
					"_id":1
				}
			},	
			{                                             
				$lookup: {                                
					from: "price",                   
					localField: "_id",                    
					foreignField: "_id",             
					as: "price"                          
				}	                                      
			},                                            
			{                                             
				$unwind: "$price"                        
			}, 
			{                                             
				$lookup: {                                
					from: "translation",                   
					localField: "_id",                    
					foreignField: "property",             
					as: "translation"                          
				}	                                      
			},                                            
			{                                             
				$unwind: "$translation"                        
			},                                            
			{ 
				$redact: { 
					"$cond": [
					{ "$eq": [ "$translation.language", "gb" ] }, 
					"$$KEEP", 
					"$$PRUNE"
					]
				}
			},
			{                                             
				$project:{                                
					"_id" : 1,                                   
					"name" : 1,                                  
					"unitNumber" : 1,                            
					"propertyType" : 1,                          
					"sqm" : 1,                                   
					"priceWeek1" :"$price.priceWeek1",          
					"commissionDay" :"$price.commissionDay",    
					"priceWeek2" :"$price.priceWeek2",          
					"commissionWeek" :"$price.commissionWeek",  
					"priceMonth1" :"$price.priceMonth1",        
					"commissionMonth" :"$price.commissionMonth",
					"priceMonth6" :"$price.priceMonth6",        
					"priceYear" :"$price.priceYear",             
					"floor" : "$translation.floor",       
					"view" : "$translation.view",         
					"furnished" : "$translation.furnished"
				}                                         
			}                                             
	    ],function(err, data) {
            if (!err) {
                resolve(data);
            } else {
                reject(new Error('ERR getAgentRentsReport : ' + err));
            }
        });
	});


    // 
	// Promise to get bookings
    // 
	var bookingCheckoutModel = require('../models/bookingCheckoutModel');
    var bookingCheckoutTable = mongoose.model('bookingCheckoutModel');
    var findBookings = new Promise(
        (resolve, reject) => {
		bookingCheckoutModel.aggregate([ matchBooking,
			{                                                          
				$project:{                                             
					"property" : 1,                                         
					"checkout": 1                                      
				}                                                      
			}                                                          
	    ],function(err, data) {
            if (!err) {
                resolve(data);
            } else {
                reject(new Error('ERR getAgentRentsReport : ' + err));
            }
        });
	});


    // 
    // Merge the results from both lookups 
    // 
	var mergeResult = function ([propertyArray, bookingArray]) {
		return new Promise((resolve, reject) => {
		for (var i=0; i<propertyArray.length; i++) {	
			var selectBooking = bookingArray.filter(function(obj){
				return obj.property == propertyArray[i]._id;
			})	
			if (selectBooking.length>0) {
				propertyArray[i].checkout = selectBooking[0].checkout
			}
		}
		res.json({error:false,propertyArray});
		resolve();
	})};


	//
	// Start all the promises
	//
	Promise.all([findProperties, findBookings])
		.then(mergeResult)
		.catch(err => {
			console.log("getAgentRentReport ERR: " + err);
			res.json({error:true,err})
		}
	)

}
