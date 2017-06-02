exports.getMessageUnread = function(req, res){

    console.log("###### getMessageUnread ######")
    var messageModel = require('../models/messageModel');
    messageModel.aggregate([
	{                                
		$match: {                    
			read:false               
		}                            
	},                               
	{                                
		$sort: {                     
			updated:1                
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
		$project:{                   
			"_id" : 0,               
			"updated" : 1,           
			"name" : "$users.name",  
			"messages" : 1           
		}                            
    }    
    ],function(err, data) {
        if(!err){
            res.json({error:false,data:data});
        }else{
            res.json({error:true,message:"ERR getMessageUnread: " + err});
        }
    });
}