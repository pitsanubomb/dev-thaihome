var propertyIdListModel = require('../models/propertyIdListModel');

exports.getPropertyIdList = function(req, res){

    console.log("###### getPropertyIdList ######")
    propertyIdListModel.aggregate([
    {
        $match:{}
    },
    { 
        $sort:{ "_id": 1 }
    },
    {
        $project:{ "_id": 1 }
    }
    ],function(err, data) {
        if(!err){
            res.json({error:false,data:data});
        }else{
            res.json({error:true,message:"ERR getPropertyIdList: " + err});
        }
    });
}