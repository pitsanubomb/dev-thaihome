var async = require('async');
var _ = require('underscore');
var moment = require('moment');
$addCallback();

var propertiesIDs = [];
var userIDs = [];
var pricesIDs = [];

var project = {
    id: "$_id",
    property: 1,
    status: 1,
    checkin: 1,
    checkout: 1,
    emails: 1,
    read: 1,
    created: 1,
    confirmation: 1,
    user: 1,
    agent: 1,
    conditionsTenant: 1,
    checked: 1,
    paymentconfirmed: 1,
    nights: 1,
    priceDay: 1,
    discountPercentage: 1,
    priceExtra: 1,
    cleanfinalprice: 1,
    rate: 1,
    rentpayday: 1,
    nextpayment: 1,
    lastpayment: 1,
    arrival: 1,
    departure: 1,
    source: 1
};

var sort = {
    $sort: {
        created: 1
    }
};

async.parallel({
        new: function (callback) {
            dpd.booking.getResource().store.getCollection().then(function (col) {
                col.aggregate([{
                    $project: project
                }, {
                    $match: {
                        status: 0,
                        $or: [{
                            created: {
                                $gt: moment().utc().subtract(3, 'days').unix()
                            }
                        }, {
                            emails: {
                                $not: {
                                    $elemMatch: {
                                        "email": /booking_confirmation/
                                    }
                                }
                            }
                        }, {
                            checked: {
                                $ne: true
                            }
                        }]
                    }
                }, sort], function (err, data) {
                    if (err) return callback(err);
                    propertiesIDs.push(_.pluck(data, 'property'));
                    userIDs.push(_.pluck(data, 'user'));
                    userIDs.push(_.pluck(data, 'agent'));
                    callback(null, data);
                });
            });
        },
        recurring: function (callback) {
            dpd.booking.getResource().store.getCollection().then(function (col) {
                col.aggregate([{
                        $project: project
                    }, {
                        $match: {
                            nextpayment: {
                                $lte: moment().utc().add(7, 'days').unix()
                            },
                            rentpayday: {
                                $gt: 0,
                                $lte: 31
                            }
                        }
                    }, sort],
                    function (err, data) {
                        if (err) return callback(err);
                        propertiesIDs.push(_.pluck(data, 'property'));
                        userIDs.push(_.pluck(data, 'user'));
                        userIDs.push(_.pluck(data, 'agent'));
                        pricesIDs.push(_.pluck(data, 'property'));
                        callback(null, data);
                    });
            });
        },
        pending: function (callback) {
            dpd.booking.getResource().store.getCollection().then(function (col) {
                col.aggregate([{
                    $project: project
                }, {
                    $match: {
                        status: 1

                    }
                }, sort], function (err, data) {
                    if (err) return callback(err);
                    propertiesIDs.push(_.pluck(data, 'property'));
                    userIDs.push(_.pluck(data, 'user'));
                    userIDs.push(_.pluck(data, 'agent'));
                    callback(null, data);
                });
            });
        },
        arrival: function (callback) {
            dpd.booking.getResource().store.getCollection().then(function (col) {
                col.aggregate([{
                    $project: project
                }, {
                    $match: {
                        status: {
                            $in: [2, 3]
                        },
                        checkin: {
                            $lte: moment().utc().add(7, 'days').unix()
                        },
                        emails: {
                            $not: {
                                $elemMatch: {
                                    "email": /arrivalnotify/
                                }
                            }
                        }
                    }
                }, sort], function (err, data) {
                    if (err) return callback(err);
                    propertiesIDs.push(_.pluck(data, 'property'));
                    userIDs.push(_.pluck(data, 'user'));
                    userIDs.push(_.pluck(data, 'agent'));
                    callback(null, data);
                });
            });
        },
        checkin: function (callback) {
            dpd.booking.getResource().store.getCollection().then(function (col) {
                col.aggregate([{
                    $project: project
                }, {
                    $match: {
                        status: {
                            $in: [2, 3]
                        },
                        checkin: {
                            $lt: moment().utc().startOf('day').add(1, 'day').unix()
                        }
                    }
                }, sort], function (err, data) {
                    if (err) return callback(err);
                    propertiesIDs.push(_.pluck(data, 'property'));
                    userIDs.push(_.pluck(data, 'user'));
                    userIDs.push(_.pluck(data, 'agent'));
                    callback(null, data);
                });
            });
        },
        checkout: function (callback) {
            dpd.booking.getResource().store.getCollection().then(function (col) {
                col.aggregate([{
                    $project: project
                }, {
                    $match: {
                        status: 4,
                        checkout: {
                            $gte: moment().utc().startOf('day').unix()
                        }
                    }
                }, sort], function (err, data) {
                    if (err) return callback(err);
                    propertiesIDs.push(_.pluck(data, 'property'));
                    userIDs.push(_.pluck(data, 'user'));
                    userIDs.push(_.pluck(data, 'agent'));
                    callback(null, data);
                });
            });
        }
    },
    function (err, results) {
        if (err) {
            setResult(err);
            $finishCallback();
        } else {
            async.parallel({
                    users: function (callback) {
                        dpd.users.get({
                            id: {
                                $in: _.flatten(_.unique(userIDs))
                            },
                            $fields: {
                                id: 1,
                                name: 1,
                                country: 1
                            }
                        }).then(function (users) {
                            callback(null, users);
                        });
                    },
                    properties: function (callback) {
                        dpd.property.get({
                            id: {
                                $in: _.flatten(_.unique(propertiesIDs))
                            },
                            $fields: {
                                id: 1,
                                unique: 1,
                            }
                        }).then(function (properties) {
                            callback(null, properties);
                        });
                    },
                    prices: function (callback) {
                        dpd.price.get({
                            property: {
                                $in: _.flatten(_.unique(pricesIDs))
                            },
                            season: "BASE",
                            $fields: {
                                property: 1,
                                priceMonth: 1
                            }
                        }).then(function (properties) {
                            callback(null, properties);
                        });
                    }
                },
                function (err, data) {
                    setResult({
                        data: results,
                        properties: _.indexBy(data.properties, 'id'),
                        users: _.indexBy(data.users, 'id'),
                        prices: _.indexBy(data.prices, 'property'),
                    });
                    $finishCallback();
                });
        }
    });