(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.locations', {
          url: 'locations/',
          css: '/css/admin.css',
          controller: 'LocationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/locations/index.html');
          },
          resolve: {
            Locations: ['Location', '$q', function (Location, $q) {
              var d = $q.defer();
              Location.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            LocationData: [function () {
              return false;
            }]
          }
        })
        .state('admin.locations.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'LocationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/locations/view.html');
          },
          resolve: {
            LocationData: ['Location', '$q', '$stateParams', function (Location, $q, $stateParams) {
              var d = $q.defer();
              Location.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.locations.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'LocationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/locations/view.html');
          },
          resolve: {
            LocationData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('LocationsCtrl', ['Location', '$stateParams', '$scope', '$state', 'Locations', 'LocationData', 'DTOptionsBuilder', 'Notification', function (Location, $stateParams, $scope, $state, Locations, LocationData, DTOptionsBuilder, Notification) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.locations = Locations;
      if (LocationData) {
        $scope.location = LocationData;
      } else {
        $scope.location = {};
      }

      $scope.delete = function (id) {
        Location.delete(id).then(function () {
          Notification.success({
            message: 'Location Deleted'
          });
          $scope.locations = _.without($scope.locations, _.findWhere($scope.locations, {
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
        Location.add($scope.location).then(function () {
          Notification.success({
            message: 'Location Modified'
          });
          $state.go('admin.locations', {}, {
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