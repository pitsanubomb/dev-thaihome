(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.properties', {
          url: 'properties/',
          css: '/css/admin.css',
          controller: 'PropertiesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/properties/index.html');
          },
          resolve: {
            Properties: ['Property', '$q', function (Property, $q) {
              var d = $q.defer();
              Property.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            PropertyData: [function () {
              return false;
            }]
          }
        })
        .state('admin.properties.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'PropertiesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/properties/view.html');
          },
          resolve: {
            PropertyData: ['Property', '$q', '$stateParams', function (Property, $q, $stateParams) {
              var d = $q.defer();
              Property.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.properties.add', {
          url: 'properties/add/',
          css: '/css/admin.css',
          controller: 'PropertiesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/properties/view.html');
          },
          resolve: {
            PropertyData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('PropertiesCtrl', ['Property', '$stateParams', '$scope', '$state', 'Properties', 'PropertyData', 'DTOptionsBuilder', 'Notification', 'FileUploader', 'CONFIG', 'Modal', '$rootScope', function (Property, $stateParams, $scope, $state, Properties, PropertyData, DTOptionsBuilder, Notification, FileUploader, CONFIG, Modal, $rootScope) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.properties = Properties;
      if (PropertyData) {
        $scope.property = PropertyData.data.property;
      } else {
        $scope.property = {
          active: false,
          location: {}
        };
      }

      var uploader = $scope.uploader = new FileUploader({
        url: CONFIG.API_URL + '/propertyimage',
        formData: [{
          "unique": $scope.property.unique,
          "id": $scope.property.id
        }],
      });

      // FILTERS
      uploader.filters.push({
        name: 'imageFilter',
        fn: function (item /*{File|FileLikeObject}*/ , options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|'.indexOf(type) !== -1;
        }
      });

      $scope.deleteImg = function (image) {
        $scope.property.images = _.without($scope.property.images, image);
      };

      $scope.featuredImg = function (image) {
        $scope.property.featured = image;
      };

      $scope.locationList = function () {
        Modal.locationList();
      };

      $rootScope.$on("locationSelected", function (event, location) {
        $scope.property.location = location;
      });

      $scope.delete = function (id) {
        Property.delete(id).then(function () {
          Notification.success({
            message: 'Property Deleted'
          });
          $scope.properties = _.without($scope.properties, _.findWhere($scope.properties, {
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
        Property.add($scope.property).then(function () {
          Notification.success({
            message: 'Property Modified'
          });
          $state.go('admin.properties', {}, {
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

  }])
    .directive('ngThumb', ['$window', function ($window) {
      var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function (item) {
          return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function (file) {
          var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      };

      return {
        restrict: 'A',
        template: '<canvas/>',
        link: function (scope, element, attributes) {
          if (!helper.support) return;

          var params = scope.$eval(attributes.ngThumb);

          if (!helper.isFile(params.file)) return;
          if (!helper.isImage(params.file)) return;

          var canvas = element.find('canvas');
          var reader = new FileReader();

          reader.onload = onLoadFile;
          reader.readAsDataURL(params.file);

          function onLoadFile(event) {
            var img = new Image();
            img.onload = onLoadImage;
            img.src = event.target.result;
          }

          function onLoadImage() {
            var width = params.width || this.width / this.height * params.height;
            var height = params.height || this.height / this.width * params.width;
            canvas.attr({
              width: width,
              height: height
            });
            canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
          }
        }
      };
    }]);
})();