var async = require('async');
var _ = require('lodash');
async.parallel({
    currencies: function(callback){
        return dpd.currency.get({active:true},function(currencies){
            currencies = _.sortBy(currencies, 'index');
            callback(null, currencies);
        });
    },
    languages: function(callback){
        return dpd.language.get({active:true},function(languages){
            callback(null, languages);
        });
    }
},
function(err, results) {
    setResult(results);
});