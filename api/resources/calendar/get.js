var async = require('async');
var _ = require('underscore');
var moment = require('moment');
var caca = 1;
$addCallback();


var start, end;


if (moment(start, 'X').format('MM YYYY') === moment().format('MM YYYY')) {
    start = moment().subtract('1', 'day').unix();
    end = moment().subtract('1', 'day').add('1', 'month').unix();
} else if (query.month && query.year) {
    start = moment('01-' + query.month + '-' + query.year, 'DD-MM-YYYY').unix();
    end = moment(moment(query.month, 'MM').add(1, 'month').endOf('month').format('DD') + '-' + moment(query.month, 'MM').add(1, 'month').format('MM') + '-' + query.month == 12 ? query.year + 1 : query.year, 'DD-MM-YYYY').unix();
} else {
    start = moment('01-' + moment().format('MM') + '-' + moment().format('YY'), 'DD-MM-YYYY').unix();
    end = moment(moment().add(1, 'month').endOf('month').format('DD') + '-' + moment().add(1, 'month').format('MM') + '-' + moment().format('YY'), 'DD-MM-YYYY').unix();
}
async.waterfall([
    function (callbackW) {
        async.parallel({
                bookings: function (callback) {
                    dpd.booking.get({
                        status: {
                            $nin: [7]
                        },
                        $or: [{
                            checkin: {
                                "$gte": start,
                                "$lte": end
                            }
                        }, {
                            checkout: {
                                "$gt": start,
                                "$lte": end
                            }
                        }],
                        $fields: {
                            property: 1,
                            user: 1,
                            id: 1,
                            checkin: 1,
                            checkout: 1,
                            status: 1,
                            source: 1
                        }
                    }, function (bookings) {
                        callback(null, bookings);
                    });
                },
                properties: function (callback) {
                    dpd.property.get({
                        $fields: {
                            id: 1,
                            unique: 1
                        }
                    }, function (properties) {
                        callback(null, properties);
                    });
                }
            },
            function (err, results) {
                if (err) callbackW(err);
                callbackW(null, results);
            });
    },
    function (results, callbackW) {
        dpd.users.get({
            id: {
                $in: _.unique(_.pluck(results.bookings, 'user'))
            },
            $fields: {
                name: 1,
                id: 1
            }
        }, function (users) {
            results.tenants = users;
            callbackW(null, results);
        });

    }
], function (err, result) {
    if (err) return cancel(err);
    var fullResults = [];
    async.each(result.bookings, function (b, callback) {
        var user = _.findWhere(result.tenants, {
            id: b.user
        });
        user = user && user.name || null;
        fullResults.push({
            property: _.findWhere(result.properties, {
                id: b.property
            }).unique,
            checkin: moment(b.checkin, 'X').format('YYYY-MM-DD'),
            checkout: moment(b.checkout, 'X').format('YYYY-MM-DD'),
            user: user,
            status: b.status,
            id: b.id,
            source: b.source
        });
        callback();
    }, function (err) {
        setResult({
            data: fullResults,
            properties: _.sortBy(result.properties, 'unique'),
            f: [start, end]
        });
        $finishCallback();
    });


});