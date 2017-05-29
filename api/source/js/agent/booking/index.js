(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent.booking', {
          url: 'booking/:id/',
          title: 'title_book',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/booking/index.html');
          },
          controller: 'AgentBookingCtrl',
          resolve: {
            BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
              var deferred = $q.defer();
              Booking.getDetails($stateParams.id).then(function (data) {
                deferred.resolve(data);
              }).catch(function (err) {
                deferred.reject(err, 404);
              });
              return deferred.promise;
          }],
            Message: ['Contact', '$q', '$rootScope', '$timeout', function (Contact, $q, $rootScope, $timeout) {
              var d = $q.defer();

              $timeout(function () {
                Contact.getMessage(null, null, $rootScope.agent.id).then(function (data) {
                  d.resolve(data);
                }).catch(function () {
                  d.resolve([]);
                });
              }, 1500);

              return d.promise;
              }]
          }
        });
    }])
    .controller('AgentBookingCtrl', ['BookingData', 'Contact', 'Modal', 'gMaps', '$scope', 'CONFIG', 'Locale', '$state', '$rootScope', 'Message', '$timeout', function (BookingData, Contact, Modal, gMaps, $scope, CONFIG, Locale, $state, $rootScope, Message, $timeout) {
      $scope.data = BookingData.data;
      $scope.data.checkin = moment.unix($scope.data.checkin).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
      $scope.data.checkout = moment.unix($scope.data.checkout).utc().format(CONFIG.DEFAULT_DATE_FORMAT);

      $scope.contact = {
        name: $rootScope.agent.name,
        email: $rootScope.agent.email
      };

      $scope.bookinglink = $state.href('booking', {
        id: $scope.data.id
      }, {
        absolute: true
      });

      if (!_.isEmpty(Message)) {
        $scope.messages = Message;
		$timeout(function () {
            $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
          }, 1000);
      } else {
        $scope.messages = {};
      }

      $scope.priceExtraTotal = 0;
      _.each($scope.data.priceExtra, function (extra) {
        $scope.priceExtraTotal = $scope.priceExtraTotal + parseInt(extra.price);
      });

      $scope.getDay = function (timestamp) {
        return Contact.getDay(timestamp);
      };

      $scope.translation = $scope.data.translation;
      $scope.property = $scope.data.property;
      $scope.messages = $scope.data.agentMessages;

      $scope.period = function () {

        return Locale.period($scope.data.nights);

      };

      $scope.askQuestion = function () {
        Contact.askQuestion($scope.contact, false, false, $scope.data.id).then(function (messages) {
          $scope.messages = messages;
          Modal.messageReceived();
          $scope.contact.message = '';
        });
      };

    }]);
})();