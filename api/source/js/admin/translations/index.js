(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.site-translations', {
          url: 'translations/',
          css: '/css/admin.css',
          controller: 'TranslationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/translations/index.html');
          },
          resolve: {
            Translations: ['Language', '$q', 'Auth', function (Language, $q, Auth) {
              var d = $q.defer();
              var query = {};
              Auth.checkLogged().then(function (data) {
                if (data.data.type === 'translator') {
                  query.shortname = {
                    $in: data.data.languages
                  };
                }
                Language.getAll(query).then(function (data) {
                  d.resolve(data);
                });
              });


              return d.promise;
            }],
            TranslationData: function () {
              return false;
            },
            TranslationDef: function () {
              return false;
            }
          }
        })
        .state('admin.site-translations.edit', {
          url: 'edit/:shortname/',
          css: '/css/admin.css',
          controller: 'TranslationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/translations/view.html');
          },
          resolve: {
            TranslationData: ['$q', '$http', '$stateParams', function ($q, $http, $stateParams) {
              var d = $q.defer();
              $http.get('/translations/' + $stateParams.shortname + '.json').then(function (data) {
                d.resolve(data.data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
            }],
            TranslationDef: ['$q', '$http', '$stateParams', 'CONFIG', function ($q, $http, $stateParams, CONFIG) {
              var d = $q.defer();
              var lng = '';
              if(localStorage.getItem('locale')){
                lng = localStorage.getItem('locale');
              }else{
                lng = CONFIG.DEFAULT_LANGUAGE;
              }
              $http.get('/translations/' + lng + '.json').then(function (data) {
                d.resolve(data.data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
            }]
          }
        })
        .state('admin.property-translations', {
          url: 'translations/property/',
          css: '/css/admin.css',
          controller: 'PropertyTranslationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/translations/property-index.html');
          },
          resolve: {
            Translations: ['Translation', '$q', 'Auth', function (Translation, $q, Auth) {
              var d = $q.defer();

              var query = {};
              Auth.checkLogged().then(function (data) {
                if (data.data.type === 'translator') {
                  query.language = {
                    $in: data.data.languages
                  };
                }
                Translation.getAll(query).then(function (data) {
                  d.resolve(data);
                });
              });
              return d.promise;
            }],
            TranslationData: function () {
              return false;
            }
          }
        })
        .state('admin.property-translations.edit', {
          url: 'edit/:id/',
          css: '/css/admin.css',
          controller: 'PropertyTranslationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/translations/property-view.html');
          },
          resolve: {
            TranslationData: ['$q', 'Translation', '$stateParams', function ($q, Translation, $stateParams) {
              var d = $q.defer();
              Translation.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
            }],
            Translations: function () {
              return false;
            }
          }
        })
        .state('admin.property-translations.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'PropertyTranslationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/translations/property-view.html');
          },
          resolve: {
            TranslationData: [function () {
              return false;
            }],
            Translations: function () {
              return false;
            }
          }
        });
    }])
    .controller('TranslationsCtrl', ['Translations', 'TranslationData', 'TranslationDef', '$stateParams', '$scope', '$state', 'DTOptionsBuilder', '$http', 'Notification', 'CONFIG', function (Translations, TranslationData, TranslationDef, $stateParams, $scope, $state, DTOptionsBuilder, $http, Notification, CONFIG) {
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.languages = Translations;

      $scope.transValueSearch = "";

      $scope.$watch("transValueSearch", function(){
        if($scope.transValueSearch == ""){
          $scope.translationKeys = _.keys(TranslationDef).sort();
          $scope.transData = $scope.translationKeys.slice(0, $scope.pagination.perPage);
          $scope.pagination = {
            number: $scope.translation.length,
            current: 1,
            perPage: 10
          };
        }else{
          $scope.transData = [];
          $scope.translationKeys = [];
          var search = $scope.transValueSearch.toLowerCase();
          angular.forEach($scope.transValues, function (item, key) {
            item = item.toLowerCase();
            if (item.indexOf(search) != -1) {
              $scope.translationKeys.push(key);
            }
          });
          $scope.transData = $scope.translationKeys.slice(0, $scope.pagination.perPage);
          $scope.pagination = {
            number: $scope.translationKeys.length,
            current: 1,
            perPage: 10
          };
        }
      });

      $scope.translationOriginal = TranslationData;

      $scope.default = function () {
        $scope.translationDefault = TranslationDef;
      };

      $scope.translationSearch = '';
      $scope.translation = _.pairs(TranslationData);
      $scope.pagination = {
        number: $scope.translation.length,
        current: 1,
        perPage: 10
      };

      $scope.translationKeys = _.keys(TranslationDef).sort();
      $scope.transData = $scope.translationKeys.slice(0, $scope.pagination.perPage);
      $scope.search = function (t) {
        $scope.searchResult = TranslationData[t];
        $scope.searchKey = t;
      };
      $scope.transValues = {};
      _.each(TranslationData, function (v, k) {
        $scope.transValues[k] = v;
      });

      $scope.updateText = function (k) {
        $scope.translationOriginal[k] = $scope.transValues[k];
        var data = {
          data: $scope.translationOriginal,
          shortname: $stateParams.shortname
        };
        $http.post(CONFIG.API_URL + '/save-translation', data).then(function () {
          Notification.success({
            message: 'Translation Updated'
          });
        });
      };
      $scope.pageChanged = function () {
        $scope.transData = $scope.translationKeys.slice(($scope.pagination.current - 1) * $scope.pagination.perPage, ($scope.pagination.current - 1) * $scope.pagination.perPage + $scope.pagination.perPage);

      };
  }])
    .controller('PropertyTranslationsCtrl', ['Translations', 'TranslationData', 'Translation', '$stateParams', '$scope', '$state', 'DTOptionsBuilder', 'Notification', 'Modal', '$rootScope', '$timeout', function (Translations, TranslationData, Translation, $stateParams, $scope, $state, DTOptionsBuilder, Notification, Modal, $rootScope, $timeout) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.translations = Translations;


      if (TranslationData) {
        $scope.translation = TranslationData;
      } else {
        $scope.translation = {
          property: {},
          amenities: [{}],
          texts: [{}]
        };
      }

      if ($rootScope.admin.type === 'translator') {
        $scope.languages = $rootScope.admin.languages;
      }

      $scope.propertyList = function () {
        Modal.propertyList();
      };

      $rootScope.$on("propertySelected", function (event, property) {
        $scope.translation.property = property;
      });

      $scope.delete = function (id) {
        Translation.delete(id).then(function () {
          Notification.success({
            message: 'Translation Deleted'
          });
          $scope.translations = _.without($scope.translations, _.findWhere($scope.translations, {
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
        if (_.keys($scope.translation.property).length) {
          $scope.translation.property = $scope.translation.property.id;
        }
        Translation.add($scope.translation).then(function () {
          Notification.success({
            message: 'Translation Modified'
          });
          $state.go('admin.property-translations', {}, {
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
        $state.go('admin.property-translations');
      };
  }]);
})();
