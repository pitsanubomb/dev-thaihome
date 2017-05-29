(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("Discount", ['CONFIG', 'User', '$q', 'dpd', '$http', function (CONFIG, User, $q, dpd, $http) {
      return {
        getDiscount: function (code, user, property) {
          var d = $q.defer();
          dpd.discount.get({
            $or: [
              {
                "user": user,
                "property": property,
                "code": code.toUpperCase(),
            },
              {
                "property": null,
                "user": user,
                "code": code.toUpperCase(),
            },
              {
                "user": null,
                "property": property,
                "code": code.toUpperCase(),
            },
              {
                "user": null,
                "property": null,
                "code": code.toUpperCase()
              }
          ],
            $limit: 1
          }).success(function (data) {
            d.resolve(data);
          });

          return d.promise;
        },
        find: function (query) {
          var d = $q.defer();
          dpd.discount.get(query).then(function (data) {
            if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.resolve({});
            }
          });

          return d.promise;
        },
        findAll: function (query) {
          var d = $q.defer();
          dpd.discount.get(query).then(function (data) {
            if (data.data.length) {
              d.resolve(data.data);
            } else {
              d.resolve({});
            }
          });

          return d.promise;
        },
        generate: function (email, booking) {
          var d = $q.defer();

          User.getOne(email, {}, true).then(function (user) {
            return user;
          }).then(function (user) {
            var rating = {
              expires: moment().add(1, 'year').unix(),
              promotion: "Rating Generated",
              percent: 5,
              user: user.id,
              code: user.name.split(' ')[0] + '' + booking.slice(-3).toString(),
              note: "Booking " + booking,
              booking: booking
            };
            dpd.discount.post(rating).success(function (rating) {
              d.resolve(rating);
            });
          });

          return d.promise;

        },
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/discount', {
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
          $http.post(CONFIG.API_URL + '/discount', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/discount/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/discount/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/discount/', {
            params: {
              details: true,
              id: id
            }
          }).then(function (data) {
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
    }])
    .directive("discount", ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/thaihome/discount/index.html');
        }
      };
	}]);

})();
