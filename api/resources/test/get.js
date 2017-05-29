$addCallback();
var x = [];
var async = require('async');
dpd.translation.get({}).then(function (data) {
    async.each(data, function(d,cb){
        x.push(d.texts);
        cb()
    }, function(b){
        setResult(JSON.stringify(x));
        $finishCallback();
    });
})