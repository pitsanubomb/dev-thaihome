(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin_login', {
          controller: 'AdminLoginCtrl',
          url: '/admin/login/',
          title: 'title_admin_login',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/login/index.html');
          },
          params: {
            to: 'admin'
          },
          resolve: {
            Admin: ['Auth', '$q', '$state', function (Auth, $q, $state) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {
                if (data.data.type === 'admin') {
                  $state.go('admin.home');
                  d.resolve(data);
                } else if (data.data.type === 'translator') {
                  $state.go('admin.site-translations');
                  d.resolve(data);
                } else {
                  d.resolve();
                }
              }).catch(function () {
                d.reject();
              });

              return d.promise;
          }]
          }
        })
        .state('admin_logout', {
          url: '/admin/logout/',
          resolve: {
            Logout: ['Auth', '$q', '$state', function (Auth, $q, $state) {
              var d = $q.defer();
              Auth.logout().then(function () {
                $state.go('admin_login', {}, {
                  reload: true
                });
                d.resolve();
              }).catch(function () {
                $state.go('admin_login', {}, {
                  reload: true
                });
                d.resolve();
              });

              return d.promise;
          }]
          }
        });
    }])
    .controller('AdminLoginCtrl', ['$scope', '$stateParams', 'Auth', '$state', function ($scope, $stateParams, Auth, $state) {
      $scope.login = function (e, p) {
        var to = $stateParams.to;
        $scope.$error = false;
        Auth.loginAdmin(e, p).then(function (data) {
          if(data.type === 'translator') return $state.go('admin.site-translations');
          $state.go(to + '.home');
        }).catch(function () {
          $scope.$error = true;
        });
      };

  }]);
})();