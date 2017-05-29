var expenseCategoryModel = require('../models/expenseCategoryModel');

exports.getExpenseCategory = function(req, res){

	console.log("###### getExpenseCategory ######")
    expenseCategoryModel.aggregate([
    {
        $match:{}
    },
    {
        $project:{"_id":1,"name":1}
    }
    ],function(err, data) {
        if(!err){
            res.json({error:false,data:data});
        }else{
            res.json({error:true,message:"ERR getExpenseCategory: " + err});
        }
    });
}