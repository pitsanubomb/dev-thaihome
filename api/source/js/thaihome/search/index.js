(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('search', {
        url: '/search/:location/',
        title: 'title_search',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/search/index.html');
        },
        params: {
          sortBy: '-price'
        },
        controller: 'SearchCtrl',
        resolve: {
          Results: ["Search", "$q", "$stateParams", "Locale", function (Search, $q, $stateParams, Locale) {
            var dates = Locale.getDates();
            var deferred = $q.defer();
            console.log(" DATES : ", dates);
            if (dates.valid) {
              var checkin = dates.checkin;
              var checkout = dates.checkout;
            } else {
              deferred.reject('Dates not set', 401);
            }

            Search.getResults($stateParams.location, checkin, checkout).then(function (data) {
              deferred.resolve(data);
              console.log(data);
            }).catch(function (err) {
              deferred.reject(err, 404);
            });
            return deferred.promise;
          }],
          Locations: ["$q", "$http", "CONFIG", function ($q, $http, CONFIG) {
            var deferred = $q.defer();
            $http.get(CONFIG.API_URL + '/location').then(function (data) {
                deferred.resolve(data);

              })
              .catch(function (err) {
                deferred.reject(err, 404);
              });
            return deferred.promise;
          }]
        }
      });
    }])
    .factory("Search", ["$http", "$q", "CONFIG", function ($http, $q, CONFIG) {
      return {
        getResults: function (location, checkin, checkout) {
          var defer = $q.defer();
          if (!checkin || !checkout) {
            defer.reject();
          } else {
            var language = localStorage.getItem('locale');
            if (!language) {
              language = 'gb'
            }
            $http.get(CONFIG.API_URL + '/search-booking/', {
                params: {
                  "location": location,
                  "checkin": checkin,
                  "checkout": checkout,
                  "language": language,
                  "format": CONFIG.DEFAULT_DATE_FORMAT
                }
              })
              .then(function (response) {
                defer.resolve(response);
              }, function (err) {
                defer.reject(err);
              });
          }

          return defer.promise;
        }
      };

    }])
    .controller('SearchCtrl', ['Modal', '$http', '$scope', 'Results', 'Locations', 'Calendar', '$rootScope', 'CONFIG', 'gMaps', '$stateParams', '$state', 'Locale', '$timeout', function (Modal, $http, $scope, Results, Locations, Calendar, $rootScope, CONFIG, gMaps, $stateParams, $state, Locale, $timeout) {

      Calendar.loadCalendar();
      $scope.locations = Locations.data;

      $scope.limits = {
        free: 10,
        booked: 0,
        increment: 10
      };


      $scope.sortBy = $stateParams.sortBy || '-price';

      $scope.search = function () {
        $state.go('search', {
          "location": $scope.location ? $scope.location : 0,
          "sortBy": $scope.sortBy
        }, {
          reload: true
        });
      };

      $scope.translations = Results.data.translations;
      $scope.location = $stateParams.location;
      $scope.freeProperties = Results.data.free;
      $scope.artificial = Results.data.artificial;
      $scope.bookedProperties = Results.data.booked;
      var dates = Locale.getDates();
      $scope.days = parseInt(moment(dates.checkout, CONFIG.DEFAULT_DATE_FORMAT).diff(dates.checkin, 'days'));
      var availableCount = $scope.freeProperties.length + $scope.bookedProperties.length;

      $scope.availableCount = availableCount;
      // console.log(Results.data.translations);


      var url = CONFIG.HELPER_URL + "/price/getPrice/";
      var objnewprice = [];

      angular.forEach(Results.data.translations, function (value, key) {
        // console.log("Key is",key,"value ",value);
        var connect = {
          method: 'POST',
          url: url,
          data: {
            "propertyID": key,
            "checkin": Date.parse(dates.checkin) / 1000,
            "checkout": Date.parse(dates.checkout) / 1000
          }
        }
        $http(connect).then(function (response) {
          //console.log("Success", response.data);
          objnewprice.push({
            "property": key,
            "price": response.data.priceFindResult.priceNight,
            "id": key
          });
          

        }, function (err) {
          console.log("Err", err);
        });

      });
      console.log(objnewprice);
      $scope.prices = objnewprice;



      if ($scope.location != 0) {
        $scope.locationName = _.findWhere($scope.locations, {
          id: $scope.location
        }).name;
      } else {
        $scope.locationName = 'All Locations';
      }


      $scope.$on('mapInitialized', function (event, map) {
        gMaps.searchMap(map, $scope.freeProperties, $scope.bookedProperties, $scope.prices);
      });

      $scope.increaseLimit = function () {
        $scope.removeWatch();
        $scope.limits.free = $scope.limits.free + $scope.limits.increment;
        if ($scope.freeProperties.length <= $scope.limits.free) {
          $scope.limits.booked += $scope.limits.increment;
        }
        $scope.watchPhoto();
      };


      if ($scope.freeProperties.length < $scope.limits.free) {
        $scope.limits.booked += $scope.limits.increment;
      }

      $scope.removeWatch = function () {
        jQuery('.offer').off('mouseenter');
        jQuery('.offer').off('mouseleave');
        jQuery('.img_switch_left, .img_switch_right').off('click');
      };

      $scope.watchPhoto = function () {
        $timeout(function () {
          jQuery(document).ready(function () {
            jQuery('.offer').mouseenter(function () {
              jQuery(this).find('.img_switch_left, .img_switch_right').show();
            });
            jQuery('.offer').mouseleave(function () {
              jQuery('.img_switch_left, .img_switch_right').hide();
            });
            jQuery('.img_switch_left, .img_switch_right').click(function (e) {
              var img = jQuery(this).parent('.prop_img_cont').find('img.offerimg');
              var property = jQuery(img).attr('property');
              var direction = parseInt(jQuery(this).attr('direction'));
              $scope.switchPhoto(property, img, direction);
            });

          });
        });
      };



      $scope.switchPhoto = function (prop, el, direction) {
        var property = _.findWhere($scope.freeProperties, {
          unique: prop.toUpperCase()
        });

        if (!property) {
          property = _.findWhere($scope.bookedProperties, {
            unique: prop.toUpperCase()
          });
        }

        var photos = property.images;
        var current_photo = jQuery(el).attr('src');
        current_photo = current_photo.split('/');
        current_photo = current_photo[current_photo.length - 1];
        var current_index = parseInt(photos.indexOf(current_photo));
        var newPhoto = photos[0];
        if (direction && photos[current_index + 1]) {
          newPhoto = photos[current_index + 1];
        } else if (direction && !photos[current_index + 1]) {
          newPhoto = photos[0];
        } else if (!direction && photos[current_index - 1]) {
          newPhoto = photos[current_index - 1];
        } else {
          newPhoto = photos[photos.length - 1];
        }
        var newSrc = jQuery(el).attr('src').replace(current_photo, newPhoto);
        jQuery(el).attr('src', newSrc);
      };

      $scope.swipe = function (direction, el) {
        var img = jQuery(el.target);
        var p = jQuery(img).attr('property');
        //p = p && p.unique || p;
        $scope.switchPhoto(p, img, direction);
      };

      $scope.watchPhoto();

    }]);
})();