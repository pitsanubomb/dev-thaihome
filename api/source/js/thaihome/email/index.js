(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("Email", ['CONFIG', '$http', '$q', '$templateCache', '$rootScope', function (CONFIG, $http, $q, $templateCache, $rootScope) {
      return {
        send: function (type, params) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/email/' + type, params).then(function (result) {
            if (params.preview) {
              d.resolve(result.data);
            } else if (result.data.status === 'sent') {
              d.resolve(true);
            } else {
              d.reject(result);
            }
          });
          return d.promise;
        },
        list: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/emails').then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        getHTML: function (type) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/email/' + type, params).then(function (result) {
            if (params.preview) {
              d.resolve(result.data);
            } else if (result.data.status === 'sent') {
              d.resolve(true);
            } else {
              d.reject(result);
            }
          });
          return d.promise;
        }
      };
    }]);
})();