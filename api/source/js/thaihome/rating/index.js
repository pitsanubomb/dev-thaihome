(function () {
  "use strict";
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('rate', {
        url: '/rating/:id/',
        title: 'title_rate',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/rating/rate.html');
        },
        controller: "RatingCtrl",
        resolve: {
          Data: ["Booking", "Rating", "$q", "$stateParams", function (Booking, Rating, $q, $stateParams) {
            var d = $q.defer();
            var result = {};
            Booking.getDetails($stateParams.id).then(function (data) {
              result.booking = data.data;
              return Rating.getBookingRating($stateParams.id);
            }).then(function (data) {
              result.rating = data;
              d.resolve(result);
            }).catch(function (err) {
              d.reject(err, 404);
            });
            return d.promise;
          }]
        }
      });
    }])
    .factory("Rating", ["$http", "$q", "CONFIG", function ($http, $q, CONFIG) {
      return {
        save: function (rating) {
          rating.avgRating = Math.round((parseInt(rating.ratings[0]) + parseInt(rating.ratings[1]) + parseInt(rating.ratings[2])) / 3 * 2) / 2;
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/rating', rating).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });

          return d.promise;
        },
        getBookingRating: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/rating', {
              params: {
                "booking": id
              }
            })
            .then(function (response) {
              if (response.data.length) {
                d.resolve(response.data[0]);
              } else {
                d.resolve({});
              }
            }, function () {
              d.resolve();
            });

          return d.promise;
        },
        getRatings: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/rating', {
              params: {
                "active": true
              }
            })
            .then(function (response) {
              d.resolve(response);
            }, function () {
              d.resolve();
            });

          return d.promise;
        },
        getPropertyRatings: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/rating', {
              params: {
                "active": true,
                "property": id
              }
            })
            .then(function (response) {
              d.resolve(response);
            }, function (err) {
              d.reject(err);
            });

          return d.promise;
        },
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/rating', {
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
          $http.post(CONFIG.API_URL + '/rating', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/rating/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/rating/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/rating/', {
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
    .controller('RatingCtrl', ['Data', 'Discount', 'Modal', 'Rating', '$scope', function (Data, Discount, Modal, Rating, $scope) {
      $scope.data = Data.booking;
      if (Data.rating.id) {
        $scope.rating = Data.rating;
        $scope.ty = true;
        Discount.find({
          booking: Data.booking.id
        }).then(function (data) {
          $scope.discount = data;
        });
      } else {
        $scope.rating = {
          property: $scope.data.property.id,
          booking: $scope.data.id,
          ratings: [3, 3, 3],
          active: false,
          user: $scope.data.user.id,
          date: moment().unix(),
          avgRating: 3
        };

      }
      $scope.save = function () {
        Rating.save($scope.rating).then(function () {
          Modal.rating();
          Discount.generate($scope.data.user.email, $scope.data.id).then(function (data) {
            $scope.rating = data;
          });
          $scope.ty = true;
        }).catch(function (e) {
          Modal.throwError(JSON.stringify(e.data.errors));
        });
      };
    }])
    .directive('ratings', ['$templateCache', function ($templateCache) {
      return {
        template: function () {
          return $templateCache.get('templates/thaihome/ratings/index.html');
        }
      };
    }])
    .directive('stars', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'E',
        template: function () {
          return $templateCache.get('templates/thaihome/ratings/stars.html');
        },
        scope: {
          stars: "@stars"
        },
        link: function (scope) {
          scope.times = function (t) {
            if (t > 0) {
              return new Array(t);
            }
          };
          scope.Math = Math;
          scope.fullstars = function () {
            return Math.floor(scope.stars);
          };
          scope.halfstars = function () {

            var c = parseFloat(scope.stars) - parseFloat(scope.fullstars());
            if (c > 0) {
              return 1;
            } else {
              return 0;
            }
          };
          scope.emptystars = function () {
            return parseInt(5 - parseInt(scope.fullstars()) - parseInt(scope.halfstars()));
          };
        }
      };
    }])
    .directive('starRating',
      function () {
        return {
          restrict: 'A',
          template: '<ul class="rating" ng-class="{readonly: rating.id}">' + '	<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' + '\u2605' + '</li>' + '</ul>',
          scope: {
            ratingValue: '=',
            max: '=',
            onRatingSelected: '&'
          },
          link: function (scope) {
            var updateStars = function () {
              scope.stars = [];
              for (var i = 0; i < scope.max; i++) {
                scope.stars.push({
                  filled: i < scope.ratingValue
                });
              }
            };

            scope.toggle = function (index) {
              scope.ratingValue = index + 1;
              scope.onRatingSelected({
                rating: index + 1
              });
            };


            scope.$watch('ratingValue',
              function (oldVal, newVal) {
                if (newVal) {
                  updateStars();
                }
              }
            );
          }
        };
      });
})();