(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('news', {
        url: '/news/',
        title: 'title_news',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/news/index.html');
        },
        controller: "NewsCtrl",
        resolve: {
          News: ["$q", "News", function ($q, News) {
            var d = $q.defer();
            News.getAll().then(function (data) {
              d.resolve(data);
            });
            return d.promise;
          }]
        }
      });
    }])
    .controller("NewsCtrl", ["$scope", "News", "$sce", function ($scope, News, $sce) {
      $scope.news = News;
      $scope.nrNews = 5;
      $scope.moreNews = function () {
        $scope.nrNews += $scope.nrNews;
      };
      $scope.deliberatelyTrustDangerousSnippet = function (text) {
        return $sce.trustAsHtml(text);
      };
    }])
    .factory('News', ['$http', 'CONFIG', '$q', 'dpd', function ($http, CONFIG, $q, dpd) {

      return {
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/news', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        getNews: function () {
          var defer = $q.defer();
          var timestamp = moment().format('X');
          var timeEnd = moment().add(60,'days').format('X');
          var query = {
            end: {
              $lte: timeEnd
            },
            start: {
              $gte: timestamp
            }
          };
          $http.get(CONFIG.API_URL + '/news', {
            params: query
          }).then(function (data) {
            defer.resolve(data.data);
          }).catch(function (err) {
            defer.resolve({
              data: []
            });
          });
          return defer.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/news', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/news/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/news/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/news/' + id).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        }
      };

    }]);
})();
