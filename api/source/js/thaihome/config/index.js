(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory('CONFIG', ['ENV', function (ENV) {

      var config = ENV;
      return config;

    }]);

})();