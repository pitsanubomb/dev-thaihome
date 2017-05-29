(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('sale', {
        url: '/sale/:id/',
        title: 'title_property',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/sale/index.html');
        },
        controller: 'PropertyCtrl',
        resolve: {
          currentUser: ['Auth', '$q', function (Auth, $q) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              d.resolve(data);
            }).catch(function (err) {
              d.resolve({});
            });

            return d.promise;
          }],
          Agent: ['$q', '$stateParams', 'User', 'Locale', function ($q, $stateParams, User, Locale) {
            var d = $q.defer();
            if ($stateParams.agent) {
              User.getDetails($stateParams.agent).then(function (data) {
                if (data.type === 'agent') {
                  d.resolve(data);
                  Locale.setAgent(data.id);
                } else {
                  d.resolve(false);
                }
              }).catch(function () {
                d.resolve(false);
              });

            } else if (Locale.getAgent()) {
              User.getDetails(Locale.getAgent()).then(function (data) {
                if (data.data.type === 'agent') {
                  d.resolve(data.data);
                } else {
                  d.resolve(false);
                }
              }).catch(function () {
                d.resolve(false);
              });
            }
            else{
              d.resolve(false);
            }

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
              Contact.getMessage(null, data.data.id, null).then(function (data) {
                d.resolve(data);
              }).catch(function (err) {
                d.resolve({
                  data: []
                });
              });
            });

            return d.promise;
          }]
        }
      });
    }]);
})();