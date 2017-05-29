var TranslationModel = require('../models/translationModel');

exports.getTranslate = function(req, res){

    console.log("translationController received: " + req.params.propertyID);

    TranslationModel.aggregate([
    {
        $match:{$and:[{property:req.params.propertyID},{language:"gb"}]}
    },
    {
        $unwind:"$texts"
    },
    {
        $project:{"_id":0,"floor":"$texts.floor","view":"$texts.view"}
    }
    ],function(err, data) {
        if(!err){
            console.log("Mongo Result: " + JSON.stringify(data, null, 4));
            res.json({error:false,data:data});
        }else{
            res.json({error:true,message:"ERROR ON SELECTING TRANSLATION"});
        }
    });
}