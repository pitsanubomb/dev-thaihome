(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.periods', {
          url: 'periods/',
          css: '/css/admin.css',
          controller: 'PeriodsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/periods/index.html');
          },
          resolve: {
            Periods: ['Period', '$q', function (Period, $q) {
              var d = $q.defer();
              Period.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            PeriodData: [function () {
              return false;
            }]
          }
        })
        .state('admin.periods.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'PeriodsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/periods/view.html');
          },
          resolve: {
            PeriodData: ['Period', '$q', '$stateParams', function (Period, $q, $stateParams) {
              var d = $q.defer();
              Period.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.periods.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'PeriodsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/periods/view.html');
          },
          resolve: {
            PeriodData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('PeriodsCtrl', ['Period', '$stateParams', '$scope', '$state', 'Periods', 'PeriodData', 'DTOptionsBuilder', 'Notification', 'Calendar', '$rootScope', '$timeout', 'Modal', function (Period, $stateParams, $scope, $state, Periods, PeriodData, DTOptionsBuilder, Notification, Calendar, $rootScope, $timeout, Modal) {
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.periods = Periods;
      if (PeriodData) {
        $scope.period = PeriodData;
      } else {
        $scope.period = {};
      }

      $scope.loadCalendar = function () {
        Calendar.doubleDates('.periodPeriod', 'periodChanged', $scope.period.from, $scope.period.to, 'D-M');
      };

      $rootScope.$on("periodChanged", function (event, data) {
        $timeout(function () {
          $scope.period.from = data.date1;
          $scope.period.to = data.date2;
        });
      });

      $scope.seasonList = function () {
        Modal.seasonList();
      };

      $rootScope.$on("seasonSelected", function (event, season) {
        $scope.period.season = season;
      });

      $scope.delete = function (id) {
        Period.delete(id).then(function () {
          Notification.success({
            message: 'Period Deleted'
          });
          $scope.periods = _.without($scope.periods, _.findWhere($scope.periods, {
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
        Period.add($scope.period).then(function () {
          Notification.success({
            message: 'Period Modified'
          });
          $state.go('admin.periods', {}, {
            reload: true
          });
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

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.periods');
      };
  }]);
})();