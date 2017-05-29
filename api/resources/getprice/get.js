var _ = require('underscore');
var async = require('async');
var moment = require('moment');
require('moment-range');

$addCallback();

async.parallel({
  prices: function (callback) {
    dpd.price.get({
      "property": query.property
    }, function (prices) {
      callback(null, prices);
    });
  },
  seasons: function (callback) {
    dpd.season.get(function (seasons) {
      callback(null, seasons);
    });
  }
}, function (err, results) {
  var seasons = results.seasons;
  var prices = results.prices;
  var seasonDays = {};
  var seasonWeekends = {};

  if (!query.checkin || !query.checkout) {

    var start = moment();
    var dayOfWeek = moment(start).format('d');
    var key = 'priceDay';
    var lowestPrice = [];
    _.each(prices, function (price) {
      lowestPrice.push(price[key]);
    });
    lowestPrice = lowestPrice.sort();
    setResult({
      price: lowestPrice[0],
      nights: 1
    });
    $finishCallback();
    return;
  }

  var start = moment(query.checkin);
  var end = moment(query.checkout);
  var days = moment(end, query.format).diff(start, 'days');

  if (days === 0) days = 1;


  async.times(days, function (n, next) {
    var weekend = false;
    var currentDate = moment(start).add(n, 'days').format('D-M');
    var currentYear = parseInt(moment(start).add(n, 'day').format('YYYY'));
    var dayOfWeek = moment(start).add(n, 'day').format('d');

    //weekend check
    if (parseInt(dayOfWeek) === 0 || parseInt(dayOfWeek) === 6) {
      weekend = true;
    }

    //find season for this day
    var currentDateParts = currentDate.split('-');
    //just in case we find no season
    var currentSeason = 'BASE';

    async.each(seasons, function (s, callback) {
      seasonDays[currentSeason] = seasonDays[currentSeason] || 0;
      seasonDays[s.season] = seasonDays[s.season] || 0;
      seasonWeekends[s.season] = seasonWeekends[s.season] || 0;
      var seasonParts = {};
      seasonParts.from = s.from.split('-');
      seasonParts.to = s.to.split('-');
      var yearFrom = currentYear;
      var yearTo = currentYear;
      if (parseInt(seasonParts.from[1]) > parseInt(seasonParts.to[1])) {
        yearFrom = currentYear - 1;
        yearTo = currentYear;
      }
      var currentDateFull = new Date(moment(start).add(n, 'day').format('YYYY'), moment(start).add(n, 'day').format('MM'), moment(start).add(n, 'day').format('DD'));
      var range = moment().range(new Date(parseInt(yearFrom), parseInt(seasonParts.from[1]), parseInt(seasonParts.from[0])), new Date(parseInt(yearTo), parseInt(seasonParts.to[1]), parseInt(seasonParts.to[0])));
      if (range.contains(currentDateFull)) {
        currentSeason = s.season;
        if (weekend) seasonWeekends[s.season]++;
      }
      callback();
    }, function (err) {
      if (err) return next(err);

      seasonDays[currentSeason]++;
      next();
    });
  }, function (err) {
    if (err) return console.log(err);

    var key;
    var split;
    if (days < 7) {
      split = 1;
      key = 'priceDay';
    } else if (days >= 7 && days < 30) {
      split = 7;
      key = 'priceWeek';
    } else if (days >= 30 && days < 365) {
      split = 30;
      key = 'priceMonth';
    } else {
      split = 365;
      key = 'priceYear';
    }
    var priceDay = 0;
    var pricePeriod = 0;
    var highestPrice = 0;
    _.each(seasonDays, function (v, k) {
      var weekends = seasonWeekends[k] || 0;
      v = v - weekends;
      var price = _.findWhere(prices, {
        season: k
      });
      priceDay += parseInt(price.priceDay) * v;
      priceDay += parseInt(price.priceWeekend) * weekends;
      highestPrice = price[key] > highestPrice ? price[key] : highestPrice;
    });

    priceDay = parseInt(priceDay / days);
    if (split === 12) {
      pricePeriod = parseInt(highestPrice / 12 / 30 / days);
    } else {

    }
    pricePeriod = parseInt(highestPrice * (days / split) / days);

    var priceHigh = _.findWhere(prices, {
      season: 'HIGH'
    });


    setResult({
      price: priceDay > pricePeriod ? pricePeriod : priceDay,
      priceMonth:priceHigh.priceMonth,
      priceYear:priceHigh.priceYear,
      priceProps:priceHigh,
      prices: [priceDay, pricePeriod],
      nights: days,
      test: highestPrice
    });
    $finishCallback();
  });
});
