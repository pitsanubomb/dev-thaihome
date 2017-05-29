(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('IPLocation', ['$http', '$q', 'CONFIG', function ($http, $q, CONFIG) {
      return {
        get: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/getip').then(function (response) {
            d.resolve(response);
          }).catch(function () {
            d.reject();
          });
          return d.promise;
        }
      };
    }]);
})();