(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent_reset', {
          url: '/agent/reset/:token/',
          controller: 'AgentResetCtrl',
          title: 'title_agent_reset',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/password-reset/index.html');
          },
          resolve: {
            Token: ['Auth', '$q', '$state', '$stateParams', function (Auth, $q, $state, $stateParams) {
              var d = $q.defer();
              Auth.checkToken($stateParams.token).then(function (data) {
                if (data) {
                  d.resolve(data);
                } else {
                  d.reject();
                }
              }).catch(function (err) {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
    }])
    .controller('AgentResetCtrl', ['Token','Modal','$scope', 'User', '$state', '$stateParams', function (Token, Modal,$scope, User, $state, $stateParams) {
      
      $scope.update = function(password){
        var data = Token;
        data.token = '';
        data.password = password;
        User.update(data.id, data).then(function(data){
          Modal.default('Password Updated');
          $state.go('agent_login');
        }).catch(function(e){
          $scope.error = e;
        })
      }
      
  }])
})();