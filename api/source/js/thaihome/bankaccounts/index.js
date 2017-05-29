(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("bankAccounts", [function () {
      return {
        get: function () {
          return["Kbank ThaiHome","Krungsri","Michael", "Kbank", "Cash"];
        }
      };
    }]);
})();
