(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('Translation', ['$http', 'CONFIG', '$q', 'dpd', function ($http, CONFIG, $q, dpd) {
      return {
        getAll: function (query) {
          var d = $q.defer();
          dpd.translation.get(query).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/translation', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/translation/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/translation/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/translation/' + id).then(function (data) {
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

        }
      };
    }]);
})();