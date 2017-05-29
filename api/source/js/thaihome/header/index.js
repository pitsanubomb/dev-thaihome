(function () {
    'use strict';
    angular.module('ThaiHome')
    .directive('header',['$templateCache',function($templateCache){
        return {
            restrict: 'AE',
            template: function(){
                return $templateCache.get('templates/thaihome/header/index.html');
            }
        }
    }]);
})();