var async = require('async');
var _ = require('underscore');
var moment = require('moment');
var func = require('bluebird');

$addCallback();


if (query.location) {
  var locationQuery = {
    location: query.location
  };
} else {
  var locationQuery = {};
}

var search = function (skip) {
  return new Promise(function (resolve, reject) {
    async.parallel({
        properties: function (callback) {
          callback = _.once(callback);
          if (ctx.query.searchonly) {
            var searchonlyParts = ctx.query.searchonly.split('-');
            if (searchonlyParts[1] > 2) {
              locationQuery[searchonlyParts[0]] = {
                $gte: parseInt(searchonlyParts[1])
              };
            } else {
              locationQuery[searchonlyParts[0]] = parseInt(searchonlyParts[1]);
            }
          }
          var nights = moment(query.checkout, query.format).diff(query.checkin, 'days');
          dpd.property.get(locationQuery, function (properties) {
            var prop = [];
            if (!skip) {
              _.each(properties, function (p) {
                if (nights && nights >= p.minimDays) prop.push(p);
              });
            } else {
              prop = properties;
            }
            callback(null, prop);
          });
        },
        translations: function (callback) {
          callback = _.once(callback);
          dpd.translation.get({
            "language": query.language
          }, function (translations) {
            if (translations) {
              var translationsIndex = _.indexBy(translations, "property");
              callback(null, translationsIndex);
            } else {
              dpd.translations.get({
                "language": "en"
              }, function (translationsDef) {
                var translationsIndex = _.indexBy(translationsDef, "property");
                callback(null, translationsIndex);
              });
            }
          });
        },
        bookings: function (callback) {
          callback = _.once(callback);
          dpd.booking.get({
            checkin: {
              "$lte": moment(query.checkout, query.format).unix()
            },
            checkout: {
              "$gt": moment(query.checkin, query.format).unix()
            }
          }, function (bookings) {
            var cleanBookings = _.map(bookings, function (booking) {
              if (_.isObject(booking.property) && booking.property.id) {
                booking.property = booking.property.id;
              }
              return booking;
            });
            var bookingsIndex = _.indexBy(cleanBookings, "property");
            callback(null, bookingsIndex);
          });
        },
        prices: function (callback) {
          callback = _.once(callback);
          dpd.price.get({
            season: "BASE"
          }, function (prices) {
            var pricesIndex = _.indexBy(prices, "property");
            callback(null, pricesIndex);
          });
        },
        ratings: function (callback) {
          callback = _.once(callback);
          dpd.rating.get({
            active: true
          }, function (ratings) {
            var groupedRating = {};
            _.each(ratings, function (rating) {
              if (typeof groupedRating[rating.property] === 'undefined') {
                groupedRating[rating.property] = [];
              }
              groupedRating[rating.property].push(rating.avgRating);
            });

            ratings = _.map(groupedRating, function (value, key) {
              var item = {
                property: key,
                rating: _.reduce(value, function (memo, num) {
                  return memo + num;
                }, 0) / value.length
              };
              return item;
            });
            callback(null, ratings);
          });
        }
      },
      function (err, results) {
        if (err) return reject(err);
        var freeProperties = [];
        var bookedProperties = [];
        var whenFree = {};
        var prices = {};
        var ratings = _.indexBy(results.ratings, 'property');
        async.forEach(results.properties, function (item, callbackEach) {
          dpd.getprice.get({
            "property": item.id,
            "checkin": query.checkin,
            "checkout": query.checkout,
            "format": query.format
          }, function (price) {
            prices[item.id] = price;
            item.ratingAvg = ratings[item.id] ? ratings[item.id].rating : null;
            item.price = prices[item.id] ? parseFloat(prices[item.id].price) : null;

            if (results.bookings[item.id]) {
              bookedProperties.push(item);
              whenFree[item.id] = results.bookings[item.id].checkout;
            } else {
              freeProperties.push(item);
            }
            callbackEach();
          });
        }, function (err) {
          if (err) return reject(err);
          var fullResults = {
            "free": freeProperties,
            "booked": bookedProperties,
            "whenFree": whenFree,
            "prices": prices,
            "translations": results.translations,
            "defaultPrices": results.prices,
            "test": {
              free: _.pluck(freeProperties, 'unique'),
              booked: _.pluck(bookedProperties, 'unique')
            }
          };
          fullResults.free = _.sortBy(fullResults.free, 'name');
          fullResults.booked = _.sortBy(fullResults.booked, 'name');
          resolve(fullResults);
        });
      });
  });
};
search().then(function (data) {
  if (!data.free.length && query.location && query.location !== 0) {
    locationQuery = {};
    search(true).then(function (result) {
      result.artificial = true;
      setResult(result);
      $finishCallback();
    }).catch(console.log);
  } else {
    setResult(data);
    $finishCallback();
  }
}).catch(console.log);