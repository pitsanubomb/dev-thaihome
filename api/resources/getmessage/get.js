var async = require('async');
var _ = require('underscore');
var Promise = require("bluebird");

if (_.keys(ctx.query).length) {
  
  $addCallback();
  //ctx.query.$limit =1
  dpd.message.get(ctx.query, function (Message) {
    if (Message.length) {
      var messages = [];
      async.each(Message, function (message, callback) {
        resolveMesage(message).then(function (data) {
          messages.push(data);
          callback();
        });
      }, function (err) {
        if (messages.length == 1) {
          setResult(messages[0]);
        } else {
          setResult(messages);
        }

        $finishCallback();
      });
    } else if (Message) {
      resolveMesage(Message).then(function (data) {
        setResult(data);
        $finishCallback();
      });
    } else {
      setResult({});
      $finishCallback();
    }
  });

}

var resolveMesage = function (message) {
  return new Promise(function (resolve, reject) {
    async.parallel({
        message: function (callback) {
          dpd.users.get({
            "id": message.user
          }, function (user) {
            message.user = user;
            callback(null, message);
          });
        },
        messages: function (callback) {
          var newMessages = [];
          async.each(message.messages, function (m, callbackEach) {
            if (m.booking) {
              dpd.booking.get({
                "id": m.booking
              }, function (booking) {
                if (booking) {
                  dpd.property.get({
                    "id": booking.property,
                    $fields: {
                      unique: 1,
                      projectName: 1
                    }
                  }, function (property) {
                    m.booking = booking;
                    m.booking.property = property;
                    newMessages.push(m);
                    callbackEach();
                  });
                } else {
                  m.booking = false;
                  m.booking.property = false;
                  newMessages.push(m);
                  callbackEach();
                }
              });
            } else if (m.property) {
              dpd.property.get({
                "id": m.property
              }, function (property) {
                if (property) {
                  m.property = property;
                } else {
                  m.property = false;
                }
                newMessages.push(m);
                callbackEach();
              });
            } else {
              newMessages.push(m);
              callbackEach();
            }


          }, function (err) {
            callback(null, newMessages);
          });
        }
      },
      function (err, results) {

        var newMessage = results.message;
        newMessage.messages = results.messages;
        resolve(newMessage);
      });
  });

};