var bankModel = require('../models/bankModel');

exports.getBankList = function(req, res){

    console.log("###### getBankList ######")
    bankModel.aggregate([
    {
        $match:{}
    },
    { 
        $sort:{ "account": 1 }
    },
    {
        $project:{ "_id": 1, "account": 1 }
    }
    ],function(err, data) {
        if(!err){
            res.json({error:false,data:data});
        }else{
            res.json({error:true,message:"ERR getBankList: " + err});
        }
    });
    
}