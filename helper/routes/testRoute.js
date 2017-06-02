// test Route
var express = require('express');
var router = express.Router();
var testController = require('../controllers/testController');
router.get('/getTest', function(req, res) {
    testController.getTest(req).then(function sendResult(myResult) {
         res.json({error:false, "myResult":myResult})
    }, err => {
        console.log("getTest ERR: " + err);
        res.json({error:true,err});
    });
});
module.exports = router;

