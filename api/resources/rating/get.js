var that = this;
var async = require('async');

async.parallel({
    user: function (callback) {
      if (that.user) {
        dpd.users.get({
          id: that.user
        }, function (user, err) {

          callback(null, user);
        });
      } else {
        callback(null, {});
      }
    },
    property: function (callback) {
      if (that.property) {
        dpd.property.get({
          id: that.property
        }, function (property) {
          callback(null, property);
        });
      } else {
        callback(null, {});
      }
    }
  },
  function (err, results) {
    that.user = results.user;
    that.property = results.property;
  });