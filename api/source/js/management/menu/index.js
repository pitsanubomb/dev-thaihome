(function () {
  'use strict';
  angular.module('ThaiHome')
    .directive('managementMenu', ['$templateCache', function ($templateCache) {
      return {
        template: function () {
          return $templateCache.get('templates/management/menu/index.html');
        },
        controller: 'ManagementMenuCtrl',
        restrict: 'AE',
      };
    }])
  .controller('ManagementMenuCtrl', ["$rootScope", "$state", "$scope", function($rootScope, $state, $scope){
    $scope.menu_messages = $rootScope.menu_messages;
    $scope.menu_bookings = $rootScope.menu_bookings;
    $scope.statename = $state.current.name;
  }]);
})();