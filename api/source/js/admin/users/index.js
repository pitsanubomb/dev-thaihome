(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.users', {
          url: 'users/',
          css: '/css/admin.css',
          controller: 'UsersCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/users/index.html');
          },
          resolve: {
            Users: ['User', '$q', function (User, $q) {
              var d = $q.defer();
              User.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            UserData: [function () {
              return false;
            }]
          }
        })
        .state('admin.users.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'UsersCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/users/view.html');
          },
          resolve: {
            UserData: ['User', '$q', '$stateParams', function (User, $q, $stateParams) {
              var d = $q.defer();
              User.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.users.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'UsersCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/users/view.html');
          },
          resolve: {
            UserData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('UsersCtrl', ['User', '$stateParams', '$scope', '$state', 'Users', 'UserData', 'DTOptionsBuilder', '$rootScope', 'Countries', 'Notification', 'Modal', 'Booking', '$timeout', '$filter', function (User, $stateParams, $scope, $state, Users, UserData, DTOptionsBuilder, $rootScope, Countries, Notification, Modal, Booking, $timeout, $filter) {
      $scope.userTypes = User.userTypes();
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.users = Users;
      if (UserData) {
        if (!UserData.languages) {
          UserData.languages = [];
        }
        $scope.user = UserData;
        $scope.user.lastContact = $filter('defaultFullDateFormat')($scope.user.lastContact);
        $scope.user.created = $filter('defaultFullDateFormat')($scope.user.created);
      } else {
        $scope.user = {
          lastContact: moment().unix(),
          created: moment().unix(),
          languages: []
        };
      }

      $timeout(function () {
        $('.adduser').click();
      }, 500);

      $scope.bookingList = function (id) {
        Booking.find({
          user: id
        }).then(function (data) {
          var bookings = _.map(data.data, function (b) {
            b.status = Booking.getStatus(b.status);
            return b;
          });
          Modal.bookingList(bookings);
        });
      };

      $scope.languages = $rootScope.languages;
      $scope.countries = Countries.list;

      $scope.delete = function (id) {
        User.delete(id).then(function () {
          Notification.success({
            message: 'User Deleted'
          });
          $scope.users = _.without($scope.users, _.findWhere($scope.users, {
            id: id
          }));
        }).catch(function (err) {
          if (err.data && err.data.errors) {
            Notification.error({
              message: JSON.stringify(err.data.errors)
            });
          } else {
            Notification.error({
              message: JSON.stringify(err.data)
            });
          }
        });
      };

      $scope.showLanguages = function () {
        var selected = [];
        angular.forEach($scope.languages, function (s) {
          if ($scope.user.languages.indexOf(s.shortname) >= 0) {
            selected.push(s.name);
          }
        });
        return selected.length ? selected.join(', ') : '-';
      };

      $scope.update = function () {
        User.add($scope.user).then(function () {
          Notification.success({
            message: 'User Modified'
          });
          $state.go('admin.users', {}, {
            reload: true
          });
        }).catch(function (err) {
          if (err.data && err.data.errors) {
            Notification.error({
              message: JSON.stringify(err.data.errors)
            });
          } else {
            Notification.error({
              message: JSON.stringify(err.data)
            });
          }
        });
      };

      $scope.back = function () {
        $state.go('admin.users', {}, {
          reload: true
        });
      };

  }]);
})();