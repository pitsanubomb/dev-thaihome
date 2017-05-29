const mongodb = require('mongoose');
const dbconfig = require('../database/config');



// translate table schema
const translateSchema = mongodb.Schema([{
    floor: { type: String},
    view: { type: String}
}]);

// translate model using translate table
const TranslateModel = module.exports = mongodb.model('TranslateModel', translateSchema, 'translation');

// translate aggregate
module.exports.getTranslate = function(parms, callback){

  console.log('TranslateModel received: ' + parms)

  TranslateModel.aggregate([
      {
        $match:{$and:[{property:parms},{language:"gb"}]}
      },
      {
        $unwind:"$texts"
      },
      {
        $project:{"_id":0,"floor":"$texts.floor","view":"$texts.view"}
      }
    ],function(err, result) {
      console.log('Err: ' + err);
      if (err) return handleError(err);    
      console.log('Mongo Result: ' + result);
      console.log('Mongo Result: ' + result[0]);
      console.log("Mongo Result: " + JSON.stringify(result, null, 4));
      return result;
      // callback(result[0]);
      // callback();
  });

}









// Report Schema
// const ReportSchema = mongodb.Schema({
//   reportname: {
//     type: String
//   },
//   email: {
//     type: String,
//     required: true
//   },
//   value : {
//     type : Number
//   }
// });

// const Report = module.exports = mongodb.model('Report', ReportSchema);

// module.exports.getReportById = function(id, callback){
//   Report.findById(id, callback);
// }

// module.exports.getReport = function(parmEmail, callback){
//   const query = {

//     value: 1234

//   }
//   Report.findOne(query, callback);
// }

// module.exports.addReport = function(newReport, callback){
//   newReport.save(callback);
// }




