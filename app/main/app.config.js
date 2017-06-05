import angular from 'angular';
import uiRouter from 'angular-ui-router';
import HomeController from '../thaihome/home/';

const app = angular.module('app', [uiRouter]);

app.config(($stateProvider, $urlRouterProvider, $locationProvider) => {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/',
                template: require('../thaihome/home/index.html'),
                controller: HomeController,
                controllerAs: 'vm'
            })

        $locationProvider.html5Mode(true);
    })
    .directive('header', function () {
        return {
            restrict: 'AE',
            template: require('../head/index.html')
        };
    });

export default app;