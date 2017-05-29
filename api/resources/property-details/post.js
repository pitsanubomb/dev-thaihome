var _ = require('underscore');
var async = require('async');
var moment = require('moment');

$addCallback();
async.waterfall([
    function (callback) {
        dpd.property.get({
            "unique": body.id
        }, function (property) {
            callback(null, property[0]);
        });
    },
    function (property, callback) {
        dpd.translation.get({
            "property": property.id,
            "language": body.language
        }, function (translation) {

            if (translation.length) {
                callback(null, property, translation[0]);
            } else {
                    dpd.translation.get({
                        "property": property.id,
                        "language": "en"
                    }, function (entranslation) {
                        callback(null, property, entranslation[0]);
                    });


            }
        });
    },
    function (property, translation, callback) {
        dpd.booking.get({
            "property": property.id
        }, function (bookings) {
            callback(null, property, translation, bookings);
        });
    },
    function (property, translation, bookings, callback) {
        dpd.price.get({
            "property": property.id,
            "season": "BASE"
        }, function (price) {
            callback(null, property, translation, bookings, price[0]);
        });
    },
    function (property, translation, bookings, price, callback) {
        dpd.location.get({}, function (locations) {
            callback(null, property, translation, bookings, price, locations);
        });
    },
    function (property, translation, bookings, price, locations, callback) {
        dpd.price.get({
            "property": property.id,
            "season": "HIGH"
        }, function (high) {
            callback(null, property, translation, bookings, price, locations, high);
        });
    }
], function (err, property, translation, bookings, price, locations, high) {
    var booked = false;
    if (bookings.length) {
        _.each(bookings, function (b) {
            if (b.checkin <= moment().unix() && b.checkout > moment().unix()) {
                booked = b.checkout;
            }
        });
    }
    property.location = _.findWhere(locations, {id: property.location});
    var data = {
        "property": property,
        "translation": translation,
        "bookings": bookings,
        "price": price,
        "booked": booked,
        'high':high
    };
    setResult(data);
    $finishCallback();
});


