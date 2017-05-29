var that = this;
var async = require('async');

async.parallel({
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
    that.property = results.property;
  });