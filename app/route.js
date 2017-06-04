import angular from 'angular';
import uiRouter from 'angular-ui-router';


const app = angular.module('app', [uiRoute]);

app.config(($stateProvider, $urlRouterProvider, $locationProvider) => {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            template: require('home/home.html'),
        })

    $locationProvider.html5Mode(true);
});

export default app;