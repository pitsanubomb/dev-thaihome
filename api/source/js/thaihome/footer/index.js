(function () {
  'use strict';
  angular.module('ThaiHome')
    .directive('footer', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/thaihome/footer/index.html');
        }
      };
    }]);
})();