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
              if ($rootScope.admin.type === 'admin') return $state.go('admin.home');
              if ($rootScope.admin.type === 'translator') $state.go('admin.site-translations');
            }
            //Loads the correct sidebar on window load,
            //collapses the sidebar on window resize.
            // Sets the min-height of #page-wrapper to window size
            $(function () {
              $('#side-menu').metisMenu();
              $(window).bind("load resize", function () {
                var topOffset = 50;
                var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
                if (width < 768) {
                  $('div.navbar-collapse').addClass('collapse');
                  topOffset = 100; // 2-row-menu
                } else {
                  $('div.navbar-collapse').removeClass('collapse');
                }

                var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
                height = height - topOffset;
                if (height < 1) height = 1;
                if (height > topOffset) {
                  $("#page-wrapper").css("min-height", (height) + "px");
                }
              });

              var url = window.location;
              var element = $('ul.nav a').filter(function () {
                return this.href == url || url.href.indexOf(this.href) == 0;
              }).addClass('active').parent().parent().addClass('in').parent();
              if (element.is('li')) {
                element.addClass('active');
              }
            });
          }],
          resolve: {
            Admin: ['Auth', '$q', '$state', '$rootScope', function (Auth, $q, $state, $rootScope) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {

                if (data.data.type === 'admin') {
                  $rootScope.admin = data.data;
                  d.resolve(data);
                } else if (data.data.type === 'translator') {
                  $rootScope.admin = data.data;
                  d.resolve(data);
                } else {
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
