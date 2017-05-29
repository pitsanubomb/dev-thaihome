(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin', {
          url: '/admin/',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/home/index.html');
          },
          controller: ["$state", "$rootScope", function ($state, $rootScope) {
            if ($state.current.name === 'admin') {
              if($rootScope.admin.type === 'admin') return $state.go('admin.home');
              if($rootScope.admin.type === 'translator') $state.go('admin.site-translations');
            }
          }],
          resolve: {
            Admin: ['Auth', '$q', '$state', '$rootScope', function (Auth, $q, $state, $rootScope) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {
                
                if (data.data.type === 'admin') {
                  $rootScope.admin = data.data;
                  d.resolve(data);
                } 
                else if(data.data.type === 'translator'){
                  $rootScope.admin = data.data;
                  d.resolve(data);
                }
                else {
                  $state.go('admin_login');
                  d.reject();
                }
              }).catch(function () {
                $state.go('admin_login');
                d.reject();
              });

              return d.promise;
          }]
          }
        })
        .state('admin.home', {
          url: 'home/',
          css: '/css/admin.css',
          controller: 'AdminHomeCtrl',
          title: 'title_admin_home',
          template: ''
        });
    }])
    .controller('AdminHomeCtrl', [function () {


  }]);
})();