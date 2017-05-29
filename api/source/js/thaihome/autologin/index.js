(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('autologin', {
        url: '/autologin/:email/',
        template: '',
        resolve: {
          login: ['User', '$q', '$stateParams', '$state', '$timeout', function (User, $q, $stateParams, $state, $timeout) {
            var d = $q.defer();
            localStorage.removeItem('auth');
            User.getOne(atob($stateParams.email)).then(function (data) {
              d.resolve(data);
              $timeout(function () {
                $state.go('contact');
              }, 1500)
            }).catch(function () {
              $state.go('home');
              d.resolve();
            });
            return d.promise;
          }]
        }
      });
    }]);
})();