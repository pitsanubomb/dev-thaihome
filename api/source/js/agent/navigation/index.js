(function () {
  'use strict';
  angular.module('ThaiHome')
    .directive('agentNavigation', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/agent/navigation/index.html');
        }
      };
    }]);
})();