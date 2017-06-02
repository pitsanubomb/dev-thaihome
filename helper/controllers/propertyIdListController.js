exports.getPropertyIdList = function(req, res){

    console.log("###### getPropertyIdList ######")
    var propertyIdListModel = require('../models/propertyIdListModel');
    propertyIdListModel.aggregate([
    {
        $match:{ "active" : true }
    },
    { 
        $sort:{ "_id": 1 }
    },
    {
        $project:{ "_id": 1, "name": 1 }
    }
    ],function(err, data) {
        if(!err){
            res.json({error:false,data:data});
        }else{
            res.json({error:true,message:"ERR getPropertyIdList: " + err});
        }
    });
}