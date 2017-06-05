import angular from 'angular';
import uiRouter from 'angular-ui-router';
import HomeController from '../thaihome/home/home.controller';

const app = angular.module('app', [uiRouter]);

app.config(($stateProvider, $urlRouterProvider, $locationProvider) => {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            template: require('../thaihome/home/home.html'),
            controller: HomeController
        })      

    $locationProvider.html5Mode(true);
});

export default app;
