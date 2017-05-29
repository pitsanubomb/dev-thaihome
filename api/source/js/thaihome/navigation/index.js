(function () {
  'use strict';
  angular.module('ThaiHome')
    .directive('navigation', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/thaihome/navigation/index.html');
        }
      };
    }]);
})();