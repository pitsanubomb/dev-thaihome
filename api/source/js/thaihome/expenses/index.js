(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("Expenses", ['CONFIG', '$http', '$q', '$templateCache', '$rootScope', function (CONFIG, $http, $q, $templateCache, $rootScope) {
      return {
        add: function (params) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/expense/', params).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        update: function (params) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/expense/' + params.id, params).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        getAll: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/expense/').then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/expense/' + id).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        }
      };
    }]);
})();
