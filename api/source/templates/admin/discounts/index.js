(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.discounts', {
          url: 'discounts/',
          css: '/css/admin.css',
          controller: 'DiscountsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/discounts/index.html');
          },
          resolve: {
            Discounts: ['Discount', '$q', function (Discount, $q) {
              var d = $q.defer();
              Discount.getAll({
                details: true
              }).then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            DiscountData: [function () {
              return false;
            }]
          }
        })
        .state('admin.discounts.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'DiscountsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/discounts/view.html');
          },
          resolve: {
            Discounts: [function () {
              return false;
            }],
            DiscountData: ['Discount', '$q', '$stateParams', function (Discount, $q, $stateParams) {
              var d = $q.defer();
              Discount.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.discounts.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'DiscountsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/discounts/view.html');
          },
          resolve: {
            DiscountData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('DiscountsCtrl', ['Discount', '$stateParams', '$scope', '$state', 'Discounts', 'DiscountData', 'DTOptionsBuilder', 'Notification', 'Modal', '$rootScope', 'CONFIG', 'Calendar', '$timeout', function (Discount, $stateParams, $scope, $state, Discounts, DiscountData, DTOptionsBuilder, Notification, Modal, $rootScope, CONFIG, Calendar, $timeout) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.discounts = Discounts;
      if (DiscountData) {
        $scope.discount = DiscountData;
      } else {
        $scope.discount = {};
      }

      $scope.loadCalendarExpire = function () {
        Calendar.singleDate('.discountexpires', 'expireChanged', $scope.discount.expires);
      };


      $rootScope.$on("expireChanged", function (event, date) {
        $timeout(function () {
          $scope.discount.expires = date;
        });
      });

      $scope.propertyList = function () {
        Modal.propertyList();
      };

      $rootScope.$on("propertySelected", function (event, property) {
        $scope.discount.property = property;
      });

      $scope.tenantList = function () {
        Modal.tenantList();
      };

      $rootScope.$on("tenantSelected", function (event, tenant) {
        $scope.discount.user = tenant;
      });

      $scope.delete = function (id) {
        Discount.delete(id).then(function () {
          Notification.success({
            message: 'Discount Deleted'
          });
          $scope.discounts = _.without($scope.discounts, _.findWhere($scope.discounts, {
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
        $scope.discount.property = $scope.discount.property.id;
        $scope.discount.user = $scope.discount.user.id;
        Discount.add($scope.discount).then(function () {
          Notification.success({
            message: 'Discounts Modified'
          });
          $state.go('admin.discounts', {}, {
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
