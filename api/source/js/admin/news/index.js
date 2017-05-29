(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.news', {
          url: 'news/',
          css: '/css/admin.css',
          controller: 'NewsICtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/news/index.html');
          },
          resolve: {
            AllNews: ['News', '$q', function (News, $q) {
              var d = $q.defer();
              News.getAll().then(function (data) {
                d.resolve(data);
              });
              return d.promise;
          }],
            NewsData: [function () {
              return false;
            }]
          }
        })
        .state('admin.news.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'NewsICtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/news/view.html');
          },
          resolve: {
            NewsData: ['News', '$q', '$stateParams', function (News, $q, $stateParams) {
              var d = $q.defer();
              News.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.news.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'NewsICtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/news/view.html');
          },
          resolve: {
            NewsData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('NewsICtrl', ['News', 'AllNews', '$stateParams', '$scope', '$state', 'NewsData', 'Notification', 'Calendar', '$rootScope', '$timeout', 'DTOptionsBuilder', function (News, AllNews, $stateParams, $scope, $state, NewsData, Notification, Calendar, $rootScope, $timeout, DTOptionsBuilder) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.allNews = AllNews;
      if (NewsData) {
        $scope.new = NewsData;
      } else {
        $scope.new = {

        };
      }

      $scope.loadCalendar = function () {
        Calendar.doubleDates('.periodPeriod', 'periodChanged2', $scope.new.start, $scope.new.end, 'X');
      };

      $rootScope.$on("periodChanged2", function (event, data) {
        $timeout(function () {
          $scope.new.start = data.date1;
          $scope.new.end = data.date2;
        });
      });

      $scope.delete = function (id) {
        News.delete(id).then(function () {
          Notification.success({
            message: 'News Deleted'
          });
          $scope.news = _.without($scope.news, _.findWhere($scope.news, {
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

      $scope.update = function () {
        News.add($scope.new).then(function () {
          Notification.success({
            message: 'News Modified'
          });
          $state.go('admin.news', {}, {
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

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.news');
      };

  }]);
})();