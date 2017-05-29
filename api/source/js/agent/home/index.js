(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent', {
          url: '/agent/',
          css: '/css/style.css',
          abstract: false,
          template: '<ui-view></ui-view>',
          controller: ["$state", function ($state) {
            if ($state.current.name === 'agent') {
              $state.go('agent.home', {}, {
                reload: true
              });
            }
          }],
          resolve: {
            Agent: ['Auth', '$q', '$state', '$rootScope', function (Auth, $q, $state, $rootScope) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {
                if (data.data.type === 'agent') {
                  $rootScope.agent = data.data;
                  d.resolve(data.data);
                } else {
                  return $state.go('agent_login');
                }
              }).catch(function () {
                return $state.go('agent_login');
              });
              return d.promise;
          }]
          }
        })
        .state('agent.home', {
          url: 'home/',
          controller: 'AgentHomeCtrl',
          css: '/css/style.css',
          title: 'title_agent_home',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/home/index.html');
          },
          params: {
            searchonly: false
          },
          resolve: {
            Results: ['Locale', '$http', '$q', 'CONFIG', '$rootScope', '$stateParams', function (Locale, $http, $q, CONFIG, $rootScope, $stateParams) {
              var d = $q.defer();
              var dates = Locale.getDates(true, true);
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
                d.resolve(data);
              }).catch(function () {
                d.resolve([]);
              });

              return d.promise;

            }],
            Bookings: ['Auth', '$rootScope', 'Booking', '$q', function (Auth, $rootScope, Booking, $q) {
              var d = $q.defer();
              Auth.checkLogged().then(function () {
                return Booking.find({
                  agent: $rootScope.agent.id
                });
              }).then(function (data) {
                d.resolve(data.data);
              }).catch(function () {
                d.resolve([]);
              });

              return d.promise;

            }]
          }
        });
    }])
    .controller('AgentHomeCtrl', ['Results', '$stateParams', 'Bookings', 'Booking', 'Calendar', '$scope', 'Auth', '$state', '$timeout', '$rootScope', function (Results, $stateParams, Bookings, Booking, Calendar, $scope, Auth, $state, $timeout, $rootScope) {
		
	  $scope.loadCheckoutDate = 1;
		  
      Calendar.loadCalendar();
      if ($stateParams.searchonly) {
        $scope.searchonly = $stateParams.searchonly;
      }

      $scope.bookings = Bookings;

      $scope.nights = Calendar.nights();

      $scope.bookingsLimit = 10;

      $scope.getStatus = function (status) {
        return Booking.getStatus(status);
      };
      $scope.prices = Results.data.prices;
      $scope.defaultPrices = Results.data.defaultPrices;
      $scope.properties = Results.data.free;
      $scope.bookedproperties = Results.data.booked;
      $scope.whenFree = Results.data.whenFree;  
	
	  $scope.$on("datesChanged", function (event, dates) {		 
		if($scope.loadCheckoutDate == 2 && $state.current.name=='agent.home'){
			$scope.search($scope.searchonly);			
		}
		$scope.loadCheckoutDate++;		  
	  });
		
      $scope.search = function (searchonly) {
        $state.go('agent.home', {
          searchonly: searchonly
        }, {
          reload: true
        });
      };

      $scope.inittooltip = function () {
        $timeout(function () {
          $('.agent-table-tooltp').powerTip({
            placement: 'n',
            smartPlacement: true
          });
        });
      };
  }]);
})();