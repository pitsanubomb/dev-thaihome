
// URL for the Node
const globalNodeUrl = 'http://localhost:3000/';       

// URL for the Website
const globalWebUrl = 'http://localhost:8080/';       

// create the module and name it Report
var app = angular.module('Report', ['ngRoute']);

// // configure our routes
app.config(function($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl : 'reportForm/',
            controller  : 'reportFormController'
        })

        // route for the Bank Account Report
        .when('/reportBankAccount', {
            templateUrl : 'reportBankAccount/',
            controller  : 'reportBankAccountController'
        })

        // route for the Bank Account Report
        .when('/reportExpense', {
            templateUrl : 'reportExpense/',
            controller  : 'reportExpenseController'
        })

        // route for the Agent Sale Report
        .when('/reportAgentSale', {
            templateUrl : 'reportAgentSale/',
            controller  : 'reportAgentSaleController'
        })

        // route for the Agent Rent Report
        .when('/reportAgentRent', {
            templateUrl : 'reportAgentRent/',
            controller  : 'reportAgentRentController'
        })

        // route for the Property Balance SHeet Report
        .when('/reportBalanceSheet', {
            templateUrl : 'reportBalanceSheet/',
            controller  : 'reportBalanceSheetController'
        })

        // route for the Bookint List Report
        .when('/reportBooking', {
            templateUrl : 'reportBooking/',
            controller  : 'reportBookingController'
        })

});

// factory to send data from reportForm to the different reports
app.factory('ReportData', function() {

    var factoryData = [];
    var factoryService = {};

    factoryService.add = function(myData) {
        console.log('FACTORY ADD: ' + myData)
        factoryData = myData;
    };

    factoryService.get = function() {
        console.log('FACTORY GET: ' + factoryData)
        return factoryData;
    };

    return factoryService;
});

