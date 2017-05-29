var mandrill = require('mandrill-api/mandrill');
var mandrill_key = process().env.MANDRILL_KEY;
var mandrill_client = new mandrill.Mandrill(mandrill_key);
var fs = require('fs');
var path = require('path');
var async = require('async');
var moment = require('moment');
var _ = require('underscore');
require("moment-duration-format");
var request = require('request');

$addCallback();
async.waterfall([
  function (callback) {
    if (ctx.body.booking) {
      dpd.booking.get({
        id: ctx.body.booking,
        full: true
      }, function (booking) {
        callback(null, booking);
      });
    } else {
      callback(null, null);
    }
  },
  function (booking, callback) {
    if (booking) {
      var result = {};
      result.booking = booking;
      result.translation = booking.translation;
      dpd.property.get({
        id: booking.property.id
      }, function (property) {
        result.property = property;
        callback(null, result);
      });

    } else {
      callback(null, null);
    }
  }, function (result, callback) {
    if (ctx.body.userID != undefined && ctx.body.userID != '') {
      dpd.users.get({
        id: ctx.body.userID
      }, function (user) {
        if (user.signature != undefined && user.signature != '') {
          callback(null, result, user.signature);
        } else {
          dpd.emails.get({
            value: 'signature'
          }, function (email) {
            if (email.length > 0) {
              var signature = email[0].html;
              callback(null, result, signature);
            } else {
              callback(null, result, null);
            }
          });
        }
      });
    } else {
      dpd.emails.get({
        value: 'signature'
      }, function (email) {
        if (email.length > 0) {
          var signature = email[0].html;
          callback(null, result, signature);
        } else {
          callback(null, result, null);
        }
      });
    }
  }
], function (err, result, signature) {
  if (err) console.log(1, err);
  var EmailData = {};
  if (result) {
    var PriceExtra = 0;
    var PriceExtraHTML = '';
    _.each(result.booking.priceExtra, function (extra) {
      PriceExtra = parseFloat(PriceExtra) + parseFloat(extra.price);
      PriceExtraHTML += '<tr>';
      PriceExtraHTML += '<td style="padding: 5px 0 0 0;border-top: 1px solid #ddd;width: 90px;font-family: arial,sans-serif;font-size:14px;">' + extra.name + '</td><td style="padding: 5px 0 0 0;border-top: 1px solid #ddd;width: 90px;font-family: arial,sans-serif;text-align:right;"><b style="font-size:14px">' +  + '</b></td>';
      PriceExtraHTML += '</tr>';
    });

    console.log(" EXTRA PRICE : ",PriceExtraHTML );
    var FinalPrice = result.booking.nights * result.booking.priceDay - (result.booking.nights * result.booking.priceDay / 100 * parseInt(result.booking.discountPercentage)) + parseFloat(PriceExtra) + result.booking.cleanfinalprice;
    FinalPrice = (FinalPrice * result.booking.rate).toFixed(0);

    var Discount = '';
    if (result.booking.discountPercentage) {
      Discount = '<tr><td style="padding: 5px 0 0 0;border-top: 1px solid #ddd;width: 90px;color:green">Discount</td><td style="padding: 5px 0 0 0;border-top: 1px solid #ddd;width: 90px;color:green">' + result.booking.currency.symbol + '' + ((result.booking.priceDay * result.booking.rate).toFixed(0) * result.booking.nights / 100 * result.booking.discountPercentage).toFixed(0) + '</td></tr>';
    } else {
      Discount = '';
    }
    var x = [];
    var a = moment.duration(result.booking.nights, "days").format('Y,M,W,D');
    var arr = a.split(',');
    arr = arr.reverse();
    if (arr[3] > 0) {
      x.push(arr[3] + ' ' + (arr[3] > 1 ? 'years' : 'year'));
    }
    if (arr[2] > 0) {
      x.push(arr[2] + ' ' + (arr[2] > 1 ? 'months' : 'month'));
    }
    if (arr[1] > 0) {
      x.push(arr[1] + ' ' + (arr[1] > 1 ? 'weeks' : 'week'));
    }
    if (arr[0] > 0) {
      x.push(arr[0] + ' ' + (arr[0] > 1 ? 'days' : 'day'));
    }
    var PERIOD = x.join(', ');

    EmailData = {
      BASE_URL: process().env.BASE_URL,
      BASE_URL_ASSETS: process().env.BASE_URL_ASSETS,
      //BOOKING_ID: result.booking.id,
      //TENANT_NAME: result.booking.user.name,
      //TENANT: result.booking.user.name,
      //TENANT_FIRSTNAME: result.booking.user.name.split(' ')[0],
      //DISCOUNT_CODE: result.booking.user.name.split(' ')[0] + '' + result.booking.id.slice(-3).toString(),
      //PROPERTY_FRONT: result.translation.texts ? result.translation.texts[0].frontpage1 : '',
      //LOCATION: result.booking.property.locationName,
      //CHECKIN: moment.unix(result.booking.checkin).utc().format('MMM D, YYYY'),
      //CHECKOUT: moment.unix(result.booking.checkout).utc().format('MMM D, YYYY'),
      //NIGHTS: result.booking.nights,
      //CURRENCY: result.booking.currency.symbol,
      //PRICE_DAY: (result.booking.priceDay * result.booking.rate).toFixed(0),
      //PRICE_BOOKING: (result.booking.priceDay * result.booking.nights * result.booking.rate).toFixed(0),
      //FINAL_CLEANING: (result.booking.cleanfinalprice * result.booking.rate).toFixed(0),
      PRICE_TOTAL: FinalPrice,
      DISCOUNT: Discount,
      //PRICE_EXTRA: PriceExtraHTML,
      SIGNATURE: signature,//????whait is this shit??
      PERIOD: PERIOD,
      HEADER: '',
      //GOOGLEMAPS: '<a style="color: #15c;" href="' + result.property.gmapslink + '">' + result.property.gmapslink + '</a>',
      //PROPERTY: result.property.name,
      //ADDRESS: result.property.address1 + '<br>' + result.property.address2 + '<br>' + result.property.address3 + '<br>',
      //ADDRESS_THAI: result.property.thaiAddress,
      //RESERVATION_FEE: result.booking.priceReservation,
      //THAIHOME_LINK: process().env.BASE_URL,
      //CLEAN_PRICE: result.property.cleanprice,
      //FINAL_CLEAN_PRICE: result.property.cleanfinalprice,
    };


    if(typeof result.booking.priceSecurity != 'undefined'){
      EmailData.DEPOSIT = result.booking.priceSecurity;
    }else{
      EmailData.DEPOSIT = '';
    }


    EmailData.RATING_LINK = EmailData.BASE_URL + 'rating/' + result.booking.id;
    EmailData.BOOKING_URL = EmailData.BASE_URL + 'booking/' + result.booking.id + '/';
    EmailData.BOOKING_LINK = EmailData.BASE_URL + 'booking/' + result.booking.id + '/';
    EmailData.VOUCHER_LINK = EmailData.BASE_URL + 'voucher/' + result.booking.id + '/';
    EmailData.FEATURED_IMG = EmailData.BASE_URL_ASSETS + '/images/property/' + result.booking.property.unique.toLowerCase() + '/' + encodeURIComponent(result.booking.property.featured);
    EmailData.CHAT_URL = EmailData.BOOKING_LINK + 'contact/';
  } else {
    EmailData = {
      BASE_URL: process().env.BASE_URL,
      BASE_URL_ASSETS: process().env.BASE_URL_ASSETS,
      SIGNATURE: signature,
      CHAT_URL: process().env.BASE_URL + 'contact/'
    };
  }


  var options = {
  url: 'http://localhost:3001/emailVariable/getVariables/' + ctx.body.booking,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  function callback(error, response, body) {
    if (!error) {
      var info = JSON.parse(body);
      _.each(info.data, function(value, key){
        if(typeof info.data[key] != 'undefined'){

          EmailData[key] = info.data[key];
        }
      })

      _.each(ctx.body, function (v, k) {
        EmailData[k.toUpperCase()] = v;
      });



      dpd.emails.get({
        value: {
          $in: ['base', parts[0]]
        }
      }, function (data) {
        var HTML = _.findWhere(data, {
          value: 'base'
        }).html;


        var HTML_CONTENT = _.findWhere(data, {
          value: parts[0]
        }).html;

        var HEADER = _.findWhere(data, {
          value: parts[0]
        }).header;
        EmailData['EMAIL_HEADER'] = HEADER;

        var SUBJECT = _.findWhere(data, {
          value: parts[0]
        }).subject;
        SUBJECT = SUBJECT || 'Missing Translation';
        _.each(EmailData, function (v, k) {
          SUBJECT = SUBJECT.replace(new RegExp('{{' + k + '}}', 'g'), v);
        });

        HTML = HTML.replace('[[[[CONTENT]]]]', HTML_CONTENT);
        HTML = HTML.replace('[[[[CONTENT_SIGNATURE]]]]', EmailData.SIGNATURE);
        var test = _.findWhere(data, {
          value: parts[0]
        })

        _.each(EmailData, function (v, k) {
          HTML = HTML.replace(new RegExp('{{' + k + '}}', 'g'), v);
        });

        var lang = ctx.body.language || 'gb';

        var translation = require(process().env.PWD + '/public/translations/' + lang + '.json');
        _.each(translation, function (v, k) {
          if (result) v = v.replace('{{TENANT_FIRSTNAME}}', result.booking.user.name.split(' ')[0]);
          HTML = HTML.replace(new RegExp('\\[\\[' + k + '\\]\\]', 'gim'), v);
          if(k == 'transMailFinal'){
          }
          HTML = HTML.replace(new RegExp('{{T.' + k + '}}', 'g'), v);
        });



        _.each(EmailData, function (v, k) {

          HTML = HTML.replace(new RegExp('{{' + k + '}}', 'g'), v);
        });

        if (ctx.body.preview) {
          var previewEmail = {
            html: HTML,
            subject: SUBJECT
          };
          setResult(previewEmail);
          $finishCallback();

        } else {
          if (ctx.body.customHTML) HTML = ctx.body.customHTML;
          if (ctx.body.customSubject){
            var lang = ctx.body.language || 'gb';
            SUBJECT = ctx.body.customSubject;
            var translation = require(process().env.PWD + '/public/translations/' + lang + '.json');
            _.each(translation, function (v, k) {
              SUBJECT = SUBJECT.replace(new RegExp('{{T.' + k + '}}', 'g'), v);
            });
            _.each(EmailData, function (v, k) {
              SUBJECT = SUBJECT.replace(new RegExp('{{' + k + '}}', 'g'), v);
            });
          }
          if (ctx.body.fileName) {
            function readAsync(file, callback) {
              fs.readFile('public/assets/voucherPDF/' + file, 'base64', callback);
            }
            var loop = require('async');
            loop.map(ctx.body.fileName, readAsync, function (err, results) {
              // results = ['file 1 content', 'file 2 content', ...]
              var emailAttachments = [];
              for (var i = 0; i < results.length; i++) {
                emailAttachments.push({
                  "type": "application/pdf",
                  "name": ctx.body.fileName[i],
                  "content": results[i]
                })
              }
              HTML = HTML.replace("�","");
              var message = {
                "html": HTML,
                "subject": SUBJECT,
                "from_email": "note@thaihome.co.uk",
                "from_name": "ThaiHome",
                "to": [{
                  "email": ctx.body.to ? ctx.body.to : ctx.body.userEmail,
                  "type": "to"
                }],
                "headers": {},
                "attachments": emailAttachments,

                "important": true
              };
              var async = true;
              var ip_pool = "Main Pool";
              mandrill_client.messages.send({
                "message": message,
                "async": async,
                "ip_pool": ip_pool
              }, function (mailResult) {
                if (result) {
                  var emails = result.booking.emails;
                  emails.push({
                    "date": moment().unix(),
                    "email": parts[0]
                  });
                  var updateBooking = {
                    id: result.booking.id,
                    emails: emails,
                    updated: moment().unix()
                  };
                  if (parts[0] === 'booking_confirmation') {
                    updateBooking.confirmation = result.booking.confirmation || moment().utc().unix();
                  }
                  if (parts[0] === 'long_term_receipt') {
                    var nextpaymentDate = 0;

                    nextpaymentDate = moment.utc(result.booking.nextpayment, 'X').add(1, 'month').format('YYYY-MM');
                    nextpaymentDate = nextpaymentDate + '-' + result.booking.rentpayday;
                    nextpaymentDate = moment.utc(nextpaymentDate, 'YYYY-MM-D').unix();
                    updateBooking.nextpayment = nextpaymentDate;
                  }
                  dpd.booking.post(updateBooking);
                }
                setResult(mailResult[0]);
                $finishCallback();
              }, function (e) {
                setResult(e);
                $finishCallback();
              });
            });

          } else {
            HTML = HTML.replace("�","");
            var message = {
              "html": HTML,
              "subject": SUBJECT,
              "from_email": "note@thaihome.co.uk",
              "from_name": "ThaiHome",
              "to": [{
                "email": ctx.body.to ? ctx.body.to : ctx.body.userEmail,
                "type": "to"
              }],
              "headers": {},
              "important": true
            };

            var async = true;
            var ip_pool = "Main Pool";
            mandrill_client.messages.send({
              "message": message,
              "async": async,
              "ip_pool": ip_pool
            }, function (mailResult) {
              if (result) {
                var emails = result.booking.emails;
                emails.push({
                  "date": moment().unix(),
                  "email": parts[0]
                });
                var updateBooking = {
                  id: result.booking.id,
                  emails: emails,
                  updated: moment().unix()
                };
                if (parts[0] === 'booking_confirmation') {
                  updateBooking.confirmation = result.booking.confirmation || moment().utc().unix();
                }
                if (parts[0] === 'long_term_receipt') {
                  var nextpaymentDate = 0;

                  nextpaymentDate = moment.utc(result.booking.nextpayment, 'X').add(1, 'month').format('YYYY-MM');
                  nextpaymentDate = nextpaymentDate + '-' + result.booking.rentpayday;
                  nextpaymentDate = moment.utc(nextpaymentDate, 'YYYY-MM-D').unix();
                  updateBooking.nextpayment = nextpaymentDate;
                }
                dpd.booking.post(updateBooking);
              }
              setResult(mailResult[0]);
              $finishCallback();
            }, function (e) {
              setResult(e);
              $finishCallback();
            });
          }
        }
      });

    }
  }

request(options, callback);


});
