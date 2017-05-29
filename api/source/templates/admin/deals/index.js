(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.deals', {
          url: 'deals/',
          css: '/css/admin.css',
          controller: 'DealsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/deals/index.html');
          },
          resolve: {
            Deals: ['HotDeals', '$q', function (HotDeals, $q) {
              var d = $q.defer();
              HotDeals.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            DealData: [function () {
              return false;
            }]
          }
        })
        .state('admin.deals.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'DealsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/deals/view.html');
          },
          resolve: {
            DealData: ['HotDeals', '$q', '$stateParams', function (HotDeals, $q, $stateParams) {
              var d = $q.defer();
              HotDeals.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.deals.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'DealsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/deals/view.html');
          },
          resolve: {
            DealData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('DealsCtrl', ['HotDeals', '$stateParams', '$scope', '$state', 'Deals', 'DealData', 'DTOptionsBuilder', 'Notification', 'Calendar', '$timeout', '$rootScope', 'Modal', 'CONFIG', function (HotDeals, $stateParams, $scope, $state, Deals, DealData, DTOptionsBuilder, Notification, Calendar, $timeout, $rootScope, Modal, CONFIG) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.deals = Deals;
      if (DealData) {
        $scope.deal = DealData;
      } else {
        $scope.deal = {
          active: false,
          hot: false,
          start: moment().unix(),
          end: moment().unix(),
          priceDay: 0,
          priceWeek: 0,
          priceMonth: 0,
          priceYear: 0
        };
      }

      $scope.loadCalendar = function () {
        Calendar.doubleDates('.dealCalendar', 'periodChanged', moment.unix($scope.deal.start).format(CONFIG.DEFAULT_DATE_FORMAT), moment.unix($scope.deal.end).format(CONFIG.DEFAULT_DATE_FORMAT));
      };

      $rootScope.$on("periodChanged", function (event, data) {
        $timeout(function () {
          $scope.deal.start = data.date1;
          $scope.deal.end = data.date2;
        });
      });

      $scope.propertyList = function () {
        Modal.propertyList();
      };

      $rootScope.$on("propertySelected", function (event, property) {
        $scope.deal.property = property;
      });

      $scope.delete = function (id) {
        HotDeals.delete(id).then(function () {
          Notification.success({
            message: 'Deal Deleted'
          });
          $scope.deals = _.without($scope.deals, _.findWhere($scope.deals, {
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
        $scope.deal.property = $scope.deal.property.id;
        $scope.deal.start = moment($scope.deal.start, CONFIG.DEFAULT_DATE_FORMAT).unix();
        $scope.deal.end = moment($scope.deal.end, CONFIG.DEFAULT_DATE_FORMAT).unix();
        HotDeals.add($scope.deal).then(function () {
          Notification.success({
            message: 'Deal Modified'
          });
          $state.go('admin.deals', {}, {
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