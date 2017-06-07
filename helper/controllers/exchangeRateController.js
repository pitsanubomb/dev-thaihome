// Exchange Rate Controller
// This Controller will give you all exchange rates from www.apilayer.net
// GET INPUT:
// - http://www.apilayer.net/api/live?access_key=e8aff3413aa473adca5877468d1fbdb1
// OUTPUT:
// - Json structure with all currency exchange rates
//
var exchangeRate = require('../models/exchangeRateModel');
var request = require('request');

exports.getRates = function() {

    // Call API to get all exchange rates
    request('http://www.apilayer.net/api/live?access_key=e8aff3413aa473adca5877468d1fbdb1',function (error, response, body) {
    if (error || response.statusCode != 200) {
        console.log('exchangeRateController getRates ERROR: ' + error);
        throw new Error('exchangeRateController getRates ERROR: ' + error);
    }

    // Convert rates to THB
    var data = JSON.parse(body);
    var THBUSD = (1/data.quotes.USDTHB).toFixed(5);
    var converted = {};
    for(key in data.quotes){
        converted[key.substring(3)] = (data.quotes[key] * THBUSD).toFixed(5);
    }

    // Save data to currencydata table 
    var newCurrencyData = exchangeRate({
        date:Math.round(new Date() / 1000),
        data:JSON.stringify({base:'THB',date:new Date(), rates:converted})
    });
    newCurrencyData.save(function(err, result) {
        if (err) {
            console.log('exchangeRateController getRates Save Date ERROR: ' + err);
            throw new Error('exchangeRateController getRates Save Date ERROR: ' + err);
        }
        // Remove the old exchange rates
        exchangeRate.find(function(err, data){
            for(var i = 0; i < data.length - 1; i++){
                data[i].remove();
            }
        });
    });
})};