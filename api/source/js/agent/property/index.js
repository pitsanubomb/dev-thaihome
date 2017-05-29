(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('agent.property', {
        url: 'property/:id/:action/',		
        title: 'title_property',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/agent/property/index.html');
        },
        controller: 'PropertyCtrl',
        resolve: {
          currentUser: ['$q', '$rootScope', function ($q, $rootScope) {
            var d = $q.defer();
            d.resolve({
              data: $rootScope.agent
            });

            return d.promise;
          }],
          PropertyData: ["Property", "$q", "$stateParams", function (Property, $q, $stateParams) {
            var deferred = $q.defer();
            Property.getDetails($stateParams.id).then(function (data) {
              deferred.resolve(data);
            }).catch(function (err) {
              deferred.reject(err, 404);
            });
            return deferred.promise;
          }],
          Ratings: ["Rating", "$q", "$stateParams", function (Rating, $q, $stateParams) {
            var d = $q.defer();
            Rating.getPropertyRatings($stateParams.id).then(function (data) {
              d.resolve(data);
            });
            return d.promise;
          }],
          Message: ['Contact', '$q', 'Auth', function (Contact, $q, Auth) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              return Contact.getMessage(null, data.data.id, null);
            }).then(function (data) {
              d.resolve(data);
            });

            return d.promise;
        }]
        }
      });
    }]);
})();