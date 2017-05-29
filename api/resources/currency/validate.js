if(this.default === true){
    var that = this;
    var async = require('async');
    
    var getter = function(){
      return dpd.currency.get({id: {$ne: that.id} });
    };

    getter().then(function(currencies){
        async.each(currencies, function(currency, cb){
            currency.default = false;
            dpd.currency.put(currency);
            cb();
        }, function(err){
            
        });
    });
}