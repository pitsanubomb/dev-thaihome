const express = require('express');
const router = express.Router();

const TranslateModel  = require('../models/reports')



//
// The router
//
router.get('/property/:propertyID', function(req, res) {

  console.log("Router received: " + req.params.propertyID);

  console.log('Calling getTranslate');

  TranslateModel.getTranslate(req.params.propertyID, (err, result) => {

      console.log('inside getTranslate');

      if (err) throw err;

      if (!result) {
        return res.json({msg: 'Nothing Found!! ' + result});
      } else {
         res.json({success:'' + result})
        console.log('SUCCESS!!: ' + result);
        console.log('floor: ' + result.floor);
        console.log('view: ' + result.view);
      }

  });

  console.log('After call of getTranslate');

});







// Old stuff
// router.post('/form', (req, res, next) => {
//   let newReport= new Report({
//     reportname: req.body.reportname,
//     email: req.body.email,
//     value: req.body.value
//   });
//   Report.addReport(newReport, (err, report) => {
//     if(err){
//       res.json({success: false, msg:'Failed to add report'});
//     } else {
//       res.json({success: true, msg:'Report can add'});
//     }
//   });
// });

// router.get('/view/:reportName', function(req, res) {
//   console.log("view report" + req.params.reportName);
//   const repname =  req.params.reportName;
//   Report.getReport(repname, (err, report) => {
//       if(err) throw err;
//       if(!report){
//         return res.json({success: false, msg: 'Report not found'});
//       }else{
//         // res.json({success:true,})
//         console.log(report.reportname);
//       }
//   });
// });


//Export 
module.exports = router;