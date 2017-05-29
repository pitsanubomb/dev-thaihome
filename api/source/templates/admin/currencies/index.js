(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.currencies', {
          url: 'currencies/',
          css: '/css/admin.css',
          controller: 'CurrenciesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/currencies/index.html');
          },
          resolve: {
            Currencies: ['Currency', '$q', function (Currency, $q) {
              var d = $q.defer();
              Currency.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            CurrencyData: [function () {
              return false;
            }]
          }
        })
        .state('admin.currencies.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'CurrenciesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/currencies/view.html');
          },
          resolve: {
            CurrencyData: ['Currency', '$q', '$stateParams', function (Currency, $q, $stateParams) {
              var d = $q.defer();
              Currency.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.currencies.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'CurrenciesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/currencies/view.html');
          },
          resolve: {
            CurrencyData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('CurrenciesCtrl', ['Currency', '$stateParams', '$scope', '$state', 'Currencies', 'CurrencyData', 'DTOptionsBuilder', 'Notification', function (Currency, $stateParams, $scope, $state, Currencies, CurrencyData, DTOptionsBuilder, Notification) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.currencies = Currencies;
      if (CurrencyData) {
        $scope.currency = CurrencyData;
      } else {
        $scope.currency = {
          active: false,
          default: false
        };
      }

      $scope.delete = function (id) {
        Currency.delete(id).then(function () {
          Notification.success({
            message: 'Currency Deleted'
          });
          $scope.currencies = _.without($scope.currencies, _.findWhere($scope.currencies, {
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
        Currency.add($scope.currency).then(function () {
          Notification.success({
            message: 'Currency Modified'
          });
          $state.go('admin.currencies', {}, {
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