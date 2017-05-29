if (!internal) {
  var that = this;
  var async = require('async');

  async.parallel({
      property: function (callback) {
        if (that.property) {
          dpd.property.get({
            id: that.property
          }, function (property, err) {
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
}