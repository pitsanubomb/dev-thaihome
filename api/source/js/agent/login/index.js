(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent_login', {
          controller: 'AgentLoginCtrl',
          url: '/agent/login/',
          title: 'title_agent_login',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/login/index.html');
          },
          resolve: {
            Agent: ['Auth', '$q', '$state', function (Auth, $q, $state) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {
                if (data.data.type === 'agent') {
                  $state.go('agent.home');
                  d.resolve(data.data);
                } else {
                  d.resolve();
                }
              }).catch(function () {
                d.resolve();
              });

              return d.promise;
          }]
          }
        })
        .state('agent_logout', {
          url: '/agent/logout/',
          resolve: {
            Logout: ['Auth', '$q', '$state', function (Auth, $q, $state) { 
              var d = $q.defer();
			  // 2016-05-26 - Ajay - Agent logout redirect on home page instead of agent login page
              Auth.logout().then(function () {
                $state.go('home', {}, {reload:true});
                d.resolve();
              }).catch(function () {
                $state.go('home', {}, {reload:true});
                d.resolve();
              });

              return d.promise;
          }]
          }
        });
    }])
    .controller('AgentLoginCtrl', ['$scope', 'Auth', '$state', function ($scope, Auth, $state) {
      $scope.login = function (e, p) {
        $scope.$error = false;
        Auth.loginAgent(e, p).then(function () {
          return $state.go('agent.home', {}, {reload:true});
        }).catch(function () {
          $scope.$error = true;
        });
      };

  }]);
})();