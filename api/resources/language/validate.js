if(this.default === true){
    var that = this;
    var async = require('async');
    
    var getter = function(){
      return dpd.language.get({id: {$ne: that.id} });
    };

    getter().then(function(languages){
        async.each(languages, function(language, cb){
            language.default = false;
            dpd.language.put(language);
            cb();
        }, function(err){
            
        });
    });
}