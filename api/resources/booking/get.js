var full = false;
if (query.full) {
  full = true;
  delete query.full;
}

if (!internal || full) {
  var async = require('async');
  $addCallback();
  var Booking = this;
  console.log(Booking);
  async.parallel({
      property: function (callback) {
        dpd.property.get({
          "id": Booking.property
        }, function (property, err) {

          if (err) return callback(err);
          callback(null, property);
        });
      },
      invoice: function (callback) {
        dpd.invoice.get({
          "bookingId": Booking.id
        }, function (property, err) {

          if (err) return callback(err);
          callback(null, property);
        });
      },
      rating: function (callback) {
          dpd.rating.get({
              "booking": Booking.id
          }, function (property, err) {

              if (err) return callback(err);
              callback(null, property);
          });
      },
      receipt: function (callback) {
        dpd.receipt.get({
          "bookingId": Booking.id
        }, function (property, err) {

          if (err) return callback(err);
          callback(null, property);
        });
      },
      user: function (callback) {
        dpd.users.get({
          "id": Booking.user
        }, function (user, err) {
          if (err) return callback(err);
          callback(null, user);
        });
      },
      agent: function (callback) {
        if (Booking.agent !== '') {
          dpd.users.get({
            "id": Booking.agent
          }, function (agent) {
            callback(null, agent);
          });
        } else {
          callback(null, {});
        }
      },
      messages: function (callback) {
        dpd.getmessage.get({
          "user": Booking.user
        }, function (messages) {
          if (messages) {
            callback(null, messages);
          } else {
            callback(null, {});
          }
        });

      },
      translation: function (callback) {
        dpd.translation.get({
          "property": Booking.property,
          "language": ctx.query.language
        }, function (translation, err) {
          if (err) return callback(err);
          if (translation.length) {
            callback(null, translation[0]);
          } else {
            if (ctx.query.language === 'en') {
              callback(null, {});
            } else {
              dpd.translation.get({
                "property": Booking.property,
                "language": "en"
              }, function (translationEn, err) {
                if (err) return callback(err);
                callback(null, translationEn[0]);
              });
            }

          }
        });
      },
      currency: function (callback) {
        dpd.currency.get({
          "id": Booking.currency
        }, function (currency, err) {
          if (err) return callback(err);
          callback(null, currency);
        });
      },
      currencydata: function (callback) {
          dpd.currencydata.get(function (currencydata, err) {
              if (err) return callback(err);
              callback(null, JSON.parse(currencydata[currencydata.length - 1].data).rates);
          });
      },

      agentMessages: function (callback) {
        if (Booking.agent !== '') {
          dpd.getmessage.get({
            "user": Booking.agent
          }, function (messages, err) {
            if (err) return callback(err);
            if (messages) {
              callback(null, messages);
            } else {
              callback(null, {});
            }
          });
        } else {
          callback(null, {});
        }
      },
      discount: function (callback) {
        if (Booking.discount) {
          dpd.discount.get({
            "id": Booking.discount
          }, function (discount, err) {
            if (err) return callback(err);
            if (discount) {
              callback(null, discount);
            } else {
              var phonyDiscount = {
                "percent": 0
              };
              callback(null, phonyDiscount);
            }
          });
        } else {
          var phonyDiscount = {
            "percent": 0
          };
          callback(null, phonyDiscount);
        }
      }
    },
    function (err, results) {
      if (err) console.log(err);
      Booking.property = results.property;
      Booking.user = results.user;
      Booking.agent = results.agent;
      Booking.translation = results.translation;
      Booking.currency = results.currency;
      Booking.currencydata = results.currencydata;
      Booking.discount = results.discount;
      Booking.messages = results.messages;
      Booking.invoice = results.invoice;
      Booking.rating = results.rating;
      Booking.receipt = results.receipt;
      Booking.agentMessages = results.agentMessages;
      $finishCallback();
    });
}
