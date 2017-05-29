var async = require('async');
var _ = require('underscore');
var moment = require('moment');

$addCallback();
async.waterfall([
    function (callback) {
        dpd.hotdeal.get(
            {"active": true, $sort: {hot: -1}}, function (hot) {
                var props = [];
                console.log("HOT DEALS : ", hot);
                var today = Math.round(new Date() / 1000);
                for (var i = 0; i < hot.length; i++) {
                    if (hot[i].start < today && today < hot[i].end) {
                        props.push(hot[i].property);
                    }
                }
                callback(null, props);
            });

    },
    function (properties, callback) {
        var prices = [];
        async.each(properties, function (prop, cb) {
            if (ctx.query.format && ctx.query.checkin && ctx.query.checkout) {
                dpd.getprice.get({
                    format: ctx.query.format,
                    checkin: ctx.query.checkin,
                    checkout: ctx.query.checkout,
                    property: prop.id
                }).then(function (data) {
                    prices.push({
                        property: prop.id,
                        price: data
                    });
                    cb();
                });
            } else {
                dpd.price.get({
                    property: prop.id,
                    season: "BASE"
                }).then(function (data) {
                    prices.push({
                        property: prop.id,
                        price: data
                    });
                    cb();
                });
            }
        }, function (err) {
            if (err) return callback(err);
            callback(null, properties, prices);
        });
    }
], function (err, properties, prices) {
    if (err) {
        setResult({});
        $finishCallback();
    }
    var propertiesIDs = _.pluck(properties, 'id');
    dpd.translation.get({
        "property": {
            $in: propertiesIDs
        },"language":ctx.query.lng || 'gb'
    }).then(function (translations) {
        var results = {};
        results.prices = _.indexBy(prices, 'property');
        results.translations = _.indexBy(translations, 'property');
        results.properties = properties;
        setResult(results);
        $finishCallback();
    });
});