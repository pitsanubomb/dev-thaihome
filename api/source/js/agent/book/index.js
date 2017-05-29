(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('agent.book', {
        url: 'book/:id/:discount/',
        title: 'title_book',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/agent/book/index.html');
        },
        controller: 'AgentBookCtrl',
        resolve: {
          check: ["Booking", "Locale", "$q", "$stateParams", function (Booking, Locale, $q, $stateParams) {
            var d = $q.defer();

            Booking.check($stateParams.id, true).then(function (data) {
              if (data) {
                d.reject();
              } else {
                d.resolve();
              }
            });
            return d.promise;

            }],
          Dates: ["$q", "Locale", function ($q, Locale) {
            var d = $q.defer();
            var dates = Locale.getDates();
			if(!dates.valid){
				Locale.setDefaultDates(true);        // 2016-05-16 - Ajay - If dates are not valid then set default dates
				dates = Locale.getDates();
			}
            if (dates.valid) {
              d.resolve(dates);
            } else {
              d.reject();
            }

            return d.promise;
          }],
          PropertyData: ["Property", "$q", "$stateParams", function (Property, $q, $stateParams) {
            var d = $q.defer();
            Property.getDetails($stateParams.id).then(function (data) {
              d.resolve(data);
            }).catch(function (err) {
              d.reject(err, 404);
            });
            return d.promise;
          }],
          Message: ['Contact', '$q', 'Auth', function (Contact, $q, Auth) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              Contact.getMessage(null, data.data.id, null).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.resolve({
                  data: []
                });
              });
            });

            return d.promise;
          }]
        }
      });
    }])
    .controller('AgentBookCtrl', ['PropertyData', 'Message', 'Booking', 'Email', 'Calendar', 'Contact', 'Modal', 'gMaps', '$scope', 'CONFIG', '$rootScope', '$http', 'Discount', 'Locale', '$stateParams', 'Payment', '$compile', '$timeout', function (PropertyData, Message, Booking, Email, Calendar, Contact, Modal, gMaps, $scope, CONFIG, $rootScope, $http, Discount, Locale, $stateParams, Payment, $compile, $timeout) {
      $scope.paymentMethods = Payment.methods();

      $scope.selectPayment = function (id) {
        $scope.paymentType = parseInt(id);
        var paymentDirectiveData = _.findWhere($scope.paymentMethods, {
          id: parseInt(id)
        });
        if (paymentDirectiveData.cc) {
          $('#payment_placeholder').html('');
        } else {
          var paymentDirectiveName = paymentDirectiveData.directive;
          var paymentDirective = $compile(paymentDirectiveName)($scope);
          $('#payment_placeholder').html(paymentDirective);
        }

      };

      $scope.contact = {
        name: $rootScope.agent.name,
        email: $rootScope.agent.email
      };

      if (!_.isEmpty(Message)) {
        $scope.messages = Message;
		$timeout(function () {
            $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
          }, 1000);
      } else {
        $scope.messages = {};
      }

      $scope.askQuestion = function () {
        Contact.askQuestion($scope.contact, false, $scope.property.id).then(function (messages) {
          $scope.messages = messages;
          Modal.messageReceived();
          $scope.contact.message = '';
        });
      };

      $scope.getDay = function (timestamp) {
        return Contact.getDay(timestamp);
      };

      Calendar.loadCalendar();
      $scope.data = {};

      $scope.property = PropertyData.data.property;
      $scope.price = PropertyData.data.price;
      $scope.discount = {
        percent: 0
      };

      $scope.applyDiscount = function () {
        if (!$scope.discount_code) {
          $scope.invalidDiscount = 'Invalid';
          return false;
        }
        Discount.getDiscount($scope.discount_code, null, $scope.property.id).then(function (discount) {
          if (discount.length) {
            $scope.discount = discount[0];
          } else {
            $scope.discount = {
              "percent": 0
            };
            $scope.discount_code = 'Invalid';
          }
        });
      };

      if ($stateParams.discount) {
        Discount.getDiscount($stateParams.discount, null, $scope.property.id).then(function (discount) {
          if (discount.length) {
            $scope.discount = discount[0];
            $scope.discount_code = $stateParams.discount;
          } else {
            $scope.discount = {
              "percent": 0
            };
          }
        });
      } else {
        $scope.discount = {
          "percent": 0
        };
      }

      $scope.ownership = function () {
        Modal.ownership();
      };

      $scope.period = function () {

        return Locale.period($scope.nights);

      };


      $rootScope.$on("datesChanged", function (event, dates) {
        $scope.checkin = dates.checkin;
        $scope.checkout = dates.checkout;
        $http.get(CONFIG.API_URL + '/getprice', {
          params: {
            "property": $scope.property.id,
            "checkin": dates.checkin,
            "checkout": dates.checkout,
            "format": CONFIG.DEFAULT_DATE_FORMAT
          }
        }).success(function (data) {
          $scope.priceDay = data.price;
          $scope.nights = data.nights;
          var key;
          if ($scope.nights < 7) {
            key = 'commissionDay';
          } else if ($scope.nights < 30) {
            key = 'commissionWeek';
          } else if ($scope.nights < 365) {
            key = 'commissionMonth';
          } else {
            key = 'commissionYear';
          }
          $scope.agentCommission = $scope.price[key];

        });

        $scope.showPrices = true;
      });

      $scope.book = function () {

        var booking = {
          "property": $scope.property.id,
          "user": {
            "email": $scope.tenant.email,
            "name": $scope.tenant.name,
            "country": $scope.contact.country,
            "phone": $scope.contact.phone,
            "agent": $rootScope.agent.id
          },
          "agent": $rootScope.agent.id,
          "agentCommission": $scope.agentCommission,
          "discount": $scope.discount.id,
          "discountPercentage": $scope.discount.percent,
          "checkin": moment.utc($scope.checkin, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
          "checkout": moment.utc($scope.checkout, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
          "status": 0,
          "currency": _.findWhere($rootScope.currencies, {
            "currency": localStorage.getItem('currency')
          }).id,
          "paymentType": $scope.paymentType,
          "priceDay": $scope.priceDay,
          "created": moment().utc().unix(),
          "utilitiesElectricity": $scope.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us",
          "utilitiesWater": $scope.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us",
          "utilitiesWifi": "Included",
          "utilitiesCable": "Included BTV",
          "rate": $rootScope.currencyRate,
          "cleanfinalprice": $scope.property.cleanfinalprice,
          "cleanprice": $scope.property.cleanprice,
          "expires": moment().utc().add(CONFIG.BOOKING_DAYS_EXPIRE, 'day').unix(),
          "nights": $scope.nights,
          "pricePaid": 0,
          "emails": []
        };

        Booking.newBooking(booking).then(function (result) {
          var emailParams = {
            booking: result.data.id,
            subject: 'Your booking on ' + $scope.property.unique,
            language: $rootScope.language
          };
          Email.send('booking_confirmation', emailParams);
          Modal.newBookingAgent($scope.tenant.email, result.data.id);
        });
      };

    }]);
})();