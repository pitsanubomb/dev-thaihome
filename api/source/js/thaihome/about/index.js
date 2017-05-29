(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('about', {
        url: '/about/',
        title: 'title_about',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/about/index.html');
        },
        controller: "AboutCtrl",
        resolve: {
          Ratings: ["$q", "Rating", function ($q, Rating) {
            var d = $q.defer();
            Rating.getRatings().then(function (data) {
              d.resolve(data);
            });
            return d.promise;
          }]
        }
      });
    }])
    .controller("AboutCtrl", ["$scope", "Ratings", function ($scope, Ratings) {
      $scope.ratings = Ratings.data;
      $scope.nrRatings = 5;
      $scope.moreReviews = function () {
        $scope.nrRatings += 5;
      };
    }]);
})();