(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.prices', {
          url: 'prices/',
          css: '/css/admin.css',
          controller: 'PricesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/prices/index.html');
          },
          resolve: {
            Prices: ['Price', '$q', function (Price, $q) {
              var d = $q.defer();
              Price.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            PriceData: [function () {
              return false;
            }]
          }
        })
        .state('admin.prices.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'PricesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/prices/view.html');
          },
          resolve: {
            PriceData: ['Price', '$q', '$stateParams', function (Price, $q, $stateParams) {
              var d = $q.defer();
              Price.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.prices.add', {
          url: 'prices/add/',
          css: '/css/admin.css',
          controller: 'PricesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/prices/view.html');
          },
          resolve: {
            PriceData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('PricesCtrl', ['Price', '$stateParams', '$scope', '$state', 'Prices', 'PriceData', 'DTOptionsBuilder', 'Notification', 'Modal', '$rootScope', '$timeout', function (Price, $stateParams, $scope, $state, Prices, PriceData, DTOptionsBuilder, Notification, Modal, $rootScope, $timeout) {
      $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
          if (fn && (typeof (fn) === 'function')) {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      };
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.prices = Prices;
      if (PriceData) {
        $scope.price = PriceData;
      } else {
        $scope.price = {
          priceDay: 0,
          priceWeek: 0,
          priceMonth: 0,
          priceYear: 0,
          commissionDay: 0,
          commissionWeek: 0,
          commissionMonth: 0,
          commissionYear: 0,
          depositDay: 0,
          depositWeek: 0,
          depositMonth: 0,
          depositYear: 0,
          priceWeekend: 0
        };
      }

      $scope.startWatch = function () {
        setTimeout(function () {
          $('form[name="editableForm"]').find('input.editable-input').keyup(function () {
            var model = $(this).prop('name');
            var value = this.value;
            $scope.$apply(function () {
              $scope.price[model] = value;
            });

          });
        }, 500);
      };

      $scope.stopWatch = function () {
        $('form[name="editableForm"]').find('input.editable-input').unbind();
      };

      $scope.propertyList = function () {
        Modal.propertyList();
      };

      $rootScope.$on("propertySelected", function (event, property) {
        $scope.price.property = property;
      });

      $scope.seasonList = function () {
        Modal.seasonList();
      };

      $rootScope.$on("seasonSelected", function (event, season) {
        $scope.price.season = season;
      });

      $scope.delete = function (id) {
        Price.delete(id).then(function () {
          Notification.success({
            message: 'Price Deleted'
          });
          $scope.prices = _.without($scope.prices, _.findWhere($scope.prices, {
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
        $scope.price.property = $scope.price.property.id;
        if (!$scope.price.created) {
          $scope.price.created = moment().unix();
        }
        Price.add($scope.price).then(function () {
          Notification.success({
            message: 'Price Modified'
          });
          $state.go('admin.prices');
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
        $state.go('admin.prices');
      };
    }]);
})();