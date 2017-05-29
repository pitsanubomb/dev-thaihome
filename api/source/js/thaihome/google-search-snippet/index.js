(function () {
  'use strict';
  angular.module('ThaiHome')
    .directive('propertySnippet', ['$templateCache', function ($templateCache) {
      return {
        scope: false,
        restrict: 'AE',
        transclude: true,
        template: function () {
          return $templateCache.get('templates/thaihome/google-search-snippet/property.html');
        }
      };
  }]);
})();