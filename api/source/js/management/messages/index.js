(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('management.messages', {
          url: 'messages/',
          css: ['/css/admin.css'],
          controller: 'ManagerMessagesCtrl',
          title: 'title_management_properties',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/management/messages/index.html');
          },
          resolve: {
            Messages: ['Contact', '$q', function (Contact, $q) {
              var d = $q.defer();

              Contact.getUnread({
                sort: {
                  updated: 1
                }
              }).then(function (data) {
                d.resolve(data);
              });
              return d.promise;
            }]
          }
        });
    }])
    .controller('ManagerMessagesCtrl', ['Messages', 'Calendar', '$stateParams', '$scope', 'Contact', 'Notification', function (Messages, Calendar, $stateParams, $scope, Contact, Notification) {
      $scope.skip = 25;
      $scope.limit = 10;
      if (_.isObject(Messages) && !_.isArray(Messages)) {
        $scope.unread = [Messages];
      } else {
        $scope.unread = Messages;
      }

      $scope.lastUnread = function (message) {
        return Contact.latestUnread(message);
      };

      //$scope.timeDiff = moment.utc().subtract(12, 'hours').unix();
      $scope.timeDiff = moment.utc().subtract(24, 'hours').unix(); // 2016-06-14 - Ajay - Set time less than 24 hours
      $scope.timeDiff1 = moment.utc().subtract(6, 'hours').unix(); // 2016-06-14 - Ajay - Set time less than 24 hours
      $scope.timeDiff2 = moment.utc().subtract(12, 'hours').unix(); // 2016-06-14 - Ajay - Set time less than 24 hours
        console.log($scope.timeDiff);

      $scope.load = function () {
        Contact.getUnread({
          limit: $scope.limit,
          skip: $scope.skip,
          sort: {
            updated: 1
          }
        }).then(function (data) {
          if (data.length) {
            $scope.unread = _.union($scope.unread, data);
            $scope.skip += $scope.limit;
          } else {
            $scope.noMore = true;
            Notification.info({
              message: '<span style="color:#fff">No more messages</span>',
              delay: 2000
            });
          }
        });
      };
  }]);
})();
