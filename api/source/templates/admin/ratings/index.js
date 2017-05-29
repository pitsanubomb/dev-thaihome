(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.ratings', {
          url: 'ratings/',
          css: '/css/admin.css',
          controller: 'RatingsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/ratings/index.html');
          },
          resolve: {
            Ratings: ['Rating', '$q', function (Rating, $q) {
              var d = $q.defer();
              Rating.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            RatingData: [function () {
              return false;
            }]
          }
        })
        .state('admin.ratings.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'RatingsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/ratings/view.html');
          },
          resolve: {
            RatingData: ['Rating', '$q', '$stateParams', function (Rating, $q, $stateParams) {
              var d = $q.defer();
              Rating.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        });
    }])
    .controller('RatingsCtrl', ['Rating', '$stateParams', '$scope', '$state', 'Ratings', 'RatingData', 'DTOptionsBuilder', 'Notification', 'Modal', '$rootScope', 'Calendar', '$timeout', function (Rating, $stateParams, $scope, $state, Ratings, RatingData, DTOptionsBuilder, Notification, Modal, $rootScope, Calendar, $timeout) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.ratings = Ratings;
      if (RatingData) {
        $scope.rating = RatingData;
      } else {
        $scope.rating = {
          ratings: [3, 3, 3],
          active: false
        };
      }

      $scope.loadCalendarDate = function () {
        Calendar.singleDate('.ratingdate', 'dateChanged', $scope.rating.date);
      };

      $rootScope.$on("dateChanged", function (event, date) {
        $timeout(function () {
          $scope.rating.date = date;
        });
      });

      $scope.delete = function (id) {
        Rating.delete(id).then(function () {
          Notification.success({
            message: 'Rating Deleted'
          });
          $scope.ratings = _.without($scope.ratings, _.findWhere($scope.ratings, {
            id: id
          }));
        }).catch(function (err) {
          if (err.data && err.data.errors) {
            Notification.error({
              message: JSON.stringify(err.data.errors)
            });
          } else {
            Notification.error({
              message: JSON.stringify(err.data)
            });
          }
        });
      };

      $scope.update = function () {
        $scope.rating.avgRating = Math.round((parseInt($scope.rating.ratings[0]) + parseInt($scope.rating.ratings[1]) + parseInt($scope.rating.ratings[2])) / 3 * 2) / 2;
        Rating.add($scope.rating).then(function () {
          Notification.success({
            message: 'Rating Modified'
          });
          $state.go('admin.ratings', {}, {
            reload: true
          });
        }).catch(function (err) {
          if (err.data && err.data.errors) {
            var formattedError = '';
            _.mapObject(err.data.errors, function (v, k) {
              formattedError += '<p class="format_error"><b>' + k + '</b> - ' + v + '</p>';
            });
            Notification.error({
              message: formattedError
            });
          } else {
            Notification.error({
              message: JSON.stringify(err.data)
            });
          }
        });
      };

  }]);
})();