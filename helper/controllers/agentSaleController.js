// Agent Sale Route
// This Route will give you data for Agent Sales Report
// GET INPUT:
// - List of property ID's or ALL
// OUTPUT:
// - Json structure with all data for the Agent Sales Report
//

var agentSaleModel = require('../models/agentSaleModel');

exports.getAgentSaleReport = function(req, res){

	//
    // Receive data from caller
	//
	console.log("###### getAgentSaleReport ######")
	console.log("Data received: " + JSON.stringify(req.body, null, 4));


    // Build the match dynamically 
    if (req.body.propertyID) {
        var properties = req.body.propertyID.map(function (obj) {
            return obj._id;
        });
        var matchStr = { 
            $match: {
                $and: 
                [{ 
                    _id: { $in: properties },
                    active : true
                }]
            }
        }
    } else {
        var matchStr = { 
            $match: {
                    active : true
            }
        }
    }


    agentSaleModel.aggregate([ matchStr,
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
                "ownership" : 1,                      
                "saleprice" : 1,                      
                "salecommission" : 1,                 
                "priceYear" :"$price.priceYear",	  			
                "floor" : "$translation.floor",       
                "view" : "$translation.view",         
                "furnished" : "$translation.furnished"
            }                                         
        }                                             
    ],function(err, data) {
        if(!err){
            //console.log("Mongo Result: " + JSON.stringify(data, null, 4));
            res.json({error:false,data:data});
        }else{
            res.json({error:true,message:"ERR getAgentSalesReport: " + err});
        }
    });
 
}



