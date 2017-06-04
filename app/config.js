import angular from 'angular';
import uiRouter from 'angular-ui-router';


const app = angular.module('app', [uiRouter]);

app.config(($stateProvider, $urlRouterProvider, $locationProvider) => {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            template: require('home/app.html'),
        })
        .state('about', {
            url: '/about',
            template: require('about/about.html')
        });

    $locationProvider.html5Mode(true);
});

export default app;