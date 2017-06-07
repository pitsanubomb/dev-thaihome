import angular from 'angular';
import uiRouter from 'angular-ui-router';
import HomeController from '../thaihome/home/';
import Calendar from '../factory/calendar';

const app = angular.module('app', [uiRouter,Calendar.name]);

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

    //Header And Footer
    .directive('header', function () {
        return {
            restrict: 'AE',
            template: require('../directive/head.html')
        };
    })

    //Other dircetive
    .directive('bookingCalendar', function () {
        return {
            restrict: 'AE',
            template: require('../directive/calendar.html')
        }
    });

export default app;