// data Route
var express = require('express');
var router = express.Router();
var dataController = require('../controllers/dataController');
router.get('/getData', function(req, res) {
    dataController.getData(req).then(function sendResult(myResult) {
         res.json({error:false, "myResult":myResult})
    }, err => {
        console.error("getData ERR: " + err);
        console.log("getData ERR: " + err);
        res.json({error:true,err});
    });
});
module.exports = router;
