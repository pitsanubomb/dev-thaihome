(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('Season', ['$http', 'CONFIG', '$q', function ($http, CONFIG, $q) {
      return {
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/season', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/season', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/season/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/season/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/season/' + id).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        },
        list: function () {
          return ['BASE', 'LOW', 'MEDIUM', 'HIGH', 'SUPER'];
        }
      };
    }]);
})();