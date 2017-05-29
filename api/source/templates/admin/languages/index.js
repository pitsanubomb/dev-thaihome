(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.languages', {
          url: 'languages/',
          css: '/css/admin.css',
          controller: 'LanguagesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/languages/index.html');
          },
          resolve: {
            Languages: ['Language', '$q', function (Language, $q) {
              var d = $q.defer();
              Language.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            LanguageData: [function () {
              return false;
            }]
          }
        })
        .state('admin.languages.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'LanguagesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/languages/view.html');
          },
          resolve: {
            LanguageData: ['Language', '$q', '$stateParams', function (Language, $q, $stateParams) {
              var d = $q.defer();
              Language.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.languages.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'LanguagesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/languages/view.html');
          },
          resolve: {
            LanguageData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('LanguagesCtrl', ['Language', '$stateParams', '$scope', '$state', 'Languages', 'LanguageData', 'DTOptionsBuilder', 'Notification', function (Language, $stateParams, $scope, $state, Languages, LanguageData, DTOptionsBuilder, Notification) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.languages = Languages;
      if (LanguageData) {
        $scope.language = LanguageData;
      } else {
        $scope.language = {
          active: false,
          default: false
        };
      }

      $scope.delete = function (id) {
        Language.delete(id).then(function () {
          Notification.success({
            message: 'Language Deleted'
          });
          $scope.languages = _.without($scope.languages, _.findWhere($scope.languages, {
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
        Language.add($scope.language).then(function () {
          Notification.success({
            message: 'Language Modified'
          });
          $state.go('admin.languages', {}, {
            reload: true
          });
        }).catch(function (err) {
          if (err.data && err.data.errors) {
            var formattedError = '';
            _.mapObject(err.data.errors, function (v, k) {
              formattedError += '<p class="format_error"><b>' + k + '</b> - ' + v + '</p>';
            });
            Notification.error({
              message: formattedError
            });
          } else {
            Notification.error({
              message: JSON.stringify(err.data)
            });
          }
        });
      };

  }]);
})();