(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('property', {
        url: '/property/:id/:discount/:agent/:action/',
        params: {
          id: {
            value: null,
            squash: true
          },
          agent: {
            value: null,
            squash: true
          },
          discount: {
            value: null,
            squash: true
          },
          action: {
            value: null,
            squash: true
          }
        },
        title: 'title_property',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/property/index.html');
        },
        controller: 'PropertyCtrl',
        resolve: {
          currentUser: ['Auth', '$q', function (Auth, $q) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              d.resolve(data);
            }).catch(function () {
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
                if (data.type === 'agent') {
                  d.resolve(data);
                } else {
                  d.resolve(false);
                }
              }).catch(function () {
                d.resolve(false);
              });
            } else {
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
              return Contact.getMessage(null, data.data.id, null);
            }).then(function (data) {
              d.resolve(data);
            });

            return d.promise;
          }]
        }
      });
    }])
    .factory("Property", ["$http", "$q", "CONFIG", "Search", function ($http, $q, CONFIG, Search) {
      return {
        getDetails: function (id) {
          var d = $q.defer();
          if (!id) {
            d.reject();
          } else {
            $http.post(CONFIG.API_URL + '/property-details/', {
                "id": id,
                "language": localStorage.getItem('locale')
              })
              .then(function (response) {
                d.resolve(response);
              }, function (err) {
                d.reject(err);
              });
          }
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/property/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/property', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        getAll: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/property')
            .then(function (data) {
              d.resolve(data.data);
            }, function (err) {
              d.reject(err);
            });
          return d.promise;
        },
        getAllDetails: function (checkin, checkout) {
          if (!checkin || !checkout) {
            checkin = moment().format(CONFIG.DEFAULT_DATE_FORMAT);
            checkout = moment().add(7, 'days').format(CONFIG.DEFAULT_DATE_FORMAT);
          }
          var d = $q.defer();
          Search.getResults(0, checkin, checkout).then(function (data) {
            d.resolve(data.data);
          });
          return d.promise;
        }
      };

    }])
    .directive('propertyDetails', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        scope: false,
        template: function () {
          return $templateCache.get('templates/thaihome/property-details/index.html');
        }
      };
    }])
    .directive('propertyAbout', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        scope: false,
        template: function () {
          return $templateCache.get('templates/thaihome/property-details/about.html');
        }
      };
    }])
    .directive('propertyMoreinfo', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        scope: false,
        template: function () {
          return $templateCache.get('templates/thaihome/property-details/more.html');
        }
      };
    }])
    .controller('PropertyCtrl', ['Modal', 'currentUser', 'Message', '$http', '$scope', '$filter', 'PropertyData', 'Ratings', 'Calendar', 'Contact', '$rootScope', 'CONFIG', 'gMaps', '$state', '$stateParams', 'Discount', 'Agent', '$timeout', function (Modal, currentUser, Message, $http, $scope, $filter, PropertyData, Ratings, Calendar, Contact, $rootScope, CONFIG, gMaps, $state, $stateParams, Discount, Agent, $timeout) {
      //Getprice 
      var start = new Date(); //start date
      var end = new Date();
      end.setDate(end.getDate() + 1); //end date
      var url = CONFIG.HELPER_URL + "/price/getPrice/";
      var objprice = [];

      //Set price in price detail (-Soon Make in fac-)
      objprice = {
        "priceWeekend": 2300,
        "priceWeek": 11500,
        "priceMonth": 23500,
        "priceYear": 270000,
        "commissionDay": 20,
        "commissionWeek": 20,
        "commissionMonth": 15,
        "commissionYear": 8.33,
        "created": 1485332191,
        "depositDay": 2000,
        "depositWeek": 5000,
        "depositMonth": 23500,
        "depositYear": 45000,
        "reservationDay": 2000,
        "reservationWeek": 2000,
        "reservationMonth": 5000,
        "reservationYear": 1000,
      }


      $scope.chatdisabled = false;
      $scope.propertyDetails = false;
      $scope.showPrices = false;
      Calendar.loadCalendar(false, false, false, PropertyData.data.bookings);
      $scope.property = PropertyData.data.property;
      $scope.translation = PropertyData.data.translation;
      $scope.high = PropertyData.data.high;
      $scope.price = objprice;
      //console.log($scope.price);
      $scope.discount = {};
      $scope.discount.percentage = 0;
      $scope.refAgent = Agent;

      if ($rootScope.agent) {
        $scope.rentlink = $state.href('property', {
          id: $scope.property.unique,
          agent: $rootScope.agent.id
        }, {
          absolute: true
        });
        $scope.salelink = $state.href('sale', {
          id: $scope.property.unique,
          agent: $rootScope.agent.id
        }, {
          absolute: true
        });
      }

      if (currentUser.data) {
        $scope.contact = {};
        $scope.contact.name = currentUser.data.name;
        $scope.contact.email = currentUser.data.email;
        $scope.contact.message = '';
      } else {
        $scope.contact = {};
      }


      if (!_.isEmpty(Message)) {
        $scope.messages = Message;
        $timeout(function () {
          $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
        }, 1000);
      } else {
        $scope.messages = {};
      }

      $scope.discount = {
        "percent": 0
      };

      $scope.applyDiscount = function () {
        if (!$scope.discount_code) {
          $scope.invalidDiscount = $rootScope.T.transDiscountErr;
          return false;
        }
        Discount.getDiscount($scope.discount_code, currentUser.data.id, $scope.property.id).then(function (discount) {
          if (discount.length) {
            $scope.discount = discount[0];
          } else {
            $scope.discount = {
              "percent": 0
            };
            $scope.discount_code = $rootScope.T.transDiscountErr;
          }
        });
      };

      if ($stateParams.discount) {
        $scope.discount_code = $stateParams.discount;
        $scope.applyDiscount();
      }

      $scope.book = function () {
        //console.log("check 1");

        if (!$scope.checkin || !$scope.checkout) {
          $('.arrival, .departure').data('dateRangePicker').open();
          //console.log("checkin1");
          return false;
        }
        if ($scope.property.minimDays > $scope.nights) {
          //console.log("checkin2");
          Modal.minimDays($scope.property.minimDays);
          return false;
        }
        //console.log("gobook");
        $state.go('book', {
          "id": $stateParams.id,
          "agent": $scope.refAgent ? $scope.refAgent.id : '',
          "discount": $scope.discount.code
        });
        // $state.go('book', {
        //   "id": $stateParams.id,
        //   "agent": $scope.refAgent ? $scope.refAgent.id : '',
        //   "discount": $scope.discount.code
        // });
        //console.log("gobook", $stateParams.id);
      };

      $scope.askQuestion = function () {
        $scope.chatdisabled = true;
        Contact.askQuestion($scope.contact, false, $scope.property.id).then(function (messages) {
          $scope.messages = messages;
          Modal.messageReceived();
          $scope.contact.message = '';
          $scope.chatdisabled = false;
        });
      };

      $scope.getDay = function (timestamp) {
        return Contact.getDay(timestamp);
      };

      $scope.getSubArray = function (array, start, end) {
        return array.slice(start, end);
      };

      $scope.ratings = Ratings.data;
      var ratings = 0;
      _.each($scope.ratings, function (rating, key) {
        ratings += rating.avgRating;
        if ($scope.ratings.length === key + 1) {
          $scope.stars = ratings / $scope.ratings.length;
        }
      });



      $scope.$on('mapInitialized', function (event, map) {
        var data = {
          address2: $scope.property.address2,
          address3: $scope.property.address3,
          name: $scope.property.name,
          featured: $scope.property.featured,
          unique: $scope.property.unique,
          gmapsdata: $scope.property.gmapsdata
        };
        gMaps.propertyMap(map, data);
      });

      $scope.openGallery = function () {
        Modal.openGallery($scope.property.images, $scope.property.unique);
      };

      $scope.rules = function () {
        Modal.rules($scope.translation);
      };

      $scope.cancellation = function () {
        Modal.cancellation();
      };

      $scope.openCalendar = function () {
        $('.arrival, .departure').data('dateRangePicker').open();
      };

      $rootScope.$on("datesChanged", function (event, dates) {
        var start = dates.checkin;
        var end = dates.checkout;
        console.log(dates.checkin);
        //console.log(Date.parse(dates.checkin) / 1000);
        //console.log(Date.parse(dates.checkout) / 1000);


        var connect = {
          method: 'POST',
          url: url,
          data: {
            "propertyID": PropertyData.data.property.unique,
            "checkin": Date.parse(start) / 1000,
            "checkout": Date.parse(end) / 1000
          }
        }
        $http(connect).then(function (response) {
          //console.log(response.data.priceFindResult);
          $scope.priceDay = response.data.priceFindResult.priceNight,
            $scope.nights = response.data.priceFindResult.nights
          $scope.checkin = start;
          $scope.checkout = end;

        }, function (err) {
          //console.log(err);
        });


        // $http.get(CONFIG.API_URL + '/getprice', {
        //   //Checkin and checkout
        //   params: {
        //     "property": $scope.property.id,
        //     "checkin": dates.checkin,
        //     "checkout": dates.checkout,
        //     "format": CONFIG.DEFAULT_DATE_FORMAT
        //   }
        // }).success(function (data) {
        //   $scope.priceDay = data.price;
        //   $scope.nights = data.nights;
        //  //console.log("nights",data.nights);
        // }).error(function(data){
        //   //console.log("Error",data);
        //   $scope.nights = (Date.parse(dates.checkout)-Date.parse(dates.checkin))/1000/86400

        // });        
        $scope.showPrices = true;
      });

      if ($stateParams.action === 'chat') {
        $('html,body').animate({
          scrollTop: $("chat").offset().top - 100
        });
      }

      $scope.scrollToChat = function () {
        $('html,body').animate({
          scrollTop: $("chat").offset().top - 100
        });
      };

      if ($stateParams.action === 'contact') {
        $('html,body').animate({
          scrollTop: $("chat").offset().top - 400
        });
        $("#txtChat").focus();
      }

    }]);
})();