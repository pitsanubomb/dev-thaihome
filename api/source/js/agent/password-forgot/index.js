(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent_forgot', {
          url: '/agent/forgot/',
          controller: 'AgentForgotCtrl',
          title: 'title_agent_forgot',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/password-forgot/index.html');
          },
          resolve: {
            Agent: ['Auth', '$q', '$state', function (Auth, $q, $state) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {
                if (data.type === 'agent') {
                  $state.go('agent.home');
                  d.resolve(data);
                } else {
                  d.resolve();
                }
              }).catch(function (err) {
                d.resolve();
              });
              return d.promise;
          }]
          }
        })
    }])
    .controller('AgentForgotCtrl', ['$scope', 'Auth', '$state', 'User', 'Modal', function ($scope, Auth, $state, User, Modal) {

      $scope.forgot = function (email) {
        $scope.error = false;
        Auth.forgotPassword(email).then(function () {
          $scope.success = true;
          Modal.default('You will receive an email with further instructions.')
        }).catch(function () {
          $scope.error = true;
        })
      }

  }])
})();