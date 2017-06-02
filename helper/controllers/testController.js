// testController.js
var dataController = require('./dataController');
exports.getTest = function(req) {
    var myArray = [300,200,400,100,500];
    var myResult = [];

    // Find all data based on myArrau
    function findData() {
        return myArray.map(callDataController);
    }

    // Call and get the specific data
    function callDataController(myValue, i) {
        return dataController.getData (
            { "myValue": myValue }
        ).catch(function(err) {
            throw new Error('ERR dataController: ' + err)
        });
    };

    // Run promises
    return Promise.all(findData());
}