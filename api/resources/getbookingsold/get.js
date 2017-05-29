var async = require('async');
var _ = require('underscore');
$addCallback();
var Booking = this;


var fields = {
    $fields: {
        id: 1,
        property: 1,
        checkin: 1,
        checkout: 1,
        nights: 1,
        status: 1,
        created: 1,
        user: 1,
        expires: 1
    }
};
var foundBookings;
query = _.extend(query, fields);
async.waterfall([
    function (callback) {
        dpd.booking.get(query, function (bookings, err) {
            if (err) return callback(err);
            callback(null, bookings);
        });
    },
    function (bookings, callback) {
        dpd.users.get({}, function (users, err) {
            if (err) return callback(err);
            callback(null, bookings, users);
        });
    },

    function (bookings, users, callback) {
        foundBookings = bookings;
        var propertiesID = _.pluck(bookings, 'property');
        dpd.property.get({
            $fields: {
                id: 1,
                unique: 1,
                projectName: 1
            },
            id: {
                $in: propertiesID
            }
        }, function (properties, err) {
            if (err) return callback(err);

            var result = _.map(foundBookings, function (b) {
                b.property = _.findWhere(properties, {
                    id: b.property
                });
                b.user = _.findWhere(users, {
                    id: b.user
                });
                b.agent = _.findWhere(users, {
                    id: b.agent
                });
                return b;
            });

            callback(null, result);
        });
    },
], function (err, result) {
    setResult(result);
    $finishCallback();
});
