(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent.chat', {
          url: 'chat/:property/',
          title: 'title_chat',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/chat/index.html');
          },
          controller: 'AgentChatCtrl',
          resolve: {
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
    }])
    .controller('AgentChatCtrl', ['Message', 'Contact', 'Modal', '$rootScope', '$scope', 'CONFIG', 'Locale', '$state', '$stateParams', '$timeout', function (Message, Contact, Modal, $rootScope, $scope, CONFIG, Locale, $state, $stateParams, $timeout) {
      $scope.focusChat = function () {
        $timeout(function () {
          jQuery('form[name=contact-form] textarea').focus();
jQuery("form[name=contact-form] input[value='']:not(:checkbox,:button):visible:first").focus();
        }, 500);
      };

      if (!_.isEmpty(Message)) {
        $scope.messages = Message;
      } else {
        $scope.messages = {};
      }

      $scope.contact = {
        name: $rootScope.agent.name,
        email: $rootScope.agent.email
      };

      $scope.askQuestion = function () {
        Contact.askQuestion($scope.contact, false, $stateParams.property, false).then(function (messages) {
          $scope.messages = messages;
          Modal.messageReceived();
          $scope.contact.message = '';
        });
      };

      $scope.getDay = function (timestamp) {
        return Contact.getDay(timestamp);
      };

    }]);
})();