(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('management.properties', {
          url: 'properties/',
          css: ['/css/admin.css'],
          controller: 'ManagerPropertiesCtrl',
          title: 'title_management_properties',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/management/properties/index.html');
          },
          resolve: {
            Results: ['Locale', '$http', '$q', 'CONFIG', '$rootScope', '$stateParams', function (Locale, $http, $q, CONFIG, $rootScope, $stateParams) {
              var d = $q.defer();
              var dates = Locale.getDates(true);
              $http.get(CONFIG.API_URL + '/search-booking', {
                params: {
                  checkin: dates.checkin,
                  checkout: dates.checkout,
                  format: CONFIG.DEFAULT_DATE_FORMAT,
                  language: $rootScope.language,
                  location: 0,
                  searchonly: $stateParams.searchonly
                }
              }).then(function (data) {
                d.resolve(data.data);
              });
              return d.promise;

            }],
          }
        });
    }])
    .controller('ManagerPropertiesCtrl', ['Results', 'Calendar', '$stateParams', '$scope', '$state', '$rootScope', function (Results, Calendar, $stateParams, $scope, $state, $rootScope) {
      Calendar.loadCalendar();
      $scope.datesChangedCount = 0;
      $scope.nights = Calendar.nights();

      $scope.prices = Results.prices;
      $scope.defaultPrices = Results.defaultPrices;
      $scope.properties = Results.free;
      $scope.bookedproperties = Results.booked;
      $scope.whenFree = Results.whenFree;

      $rootScope.$on("datesChanged", function (event, dates) {
        $scope.checkin = dates.checkin;
        $scope.checkout = dates.checkout;
      });

      $scope.search = function () {
        $state.go('management.properties', {}, {
          reload: true
        });
      };
  }]);
})();