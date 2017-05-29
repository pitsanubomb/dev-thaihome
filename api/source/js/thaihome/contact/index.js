(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('contact', {
        url: '/contact/',
        title: 'title_contact',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/contact/index.html');
        },
        controller: 'ContactCtrl',
        resolve: {
          currentUser: ['Auth', '$q', function (Auth, $q) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              d.resolve(data);
            }).catch(function () {
              d.resolve();
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
    .controller('ContactCtrl', ['Contact', 'Auth', 'Modal', '$http', '$scope', '$rootScope', 'CONFIG', 'currentUser', 'Message', '$timeout', function (Contact, Auth, Modal, $http, $scope, $rootScope, CONFIG, currentUser, Message, $timeout) {
      $scope.chatdisabled = false;
      $scope.focusChat = function () {
        $timeout(function () {
          jQuery('form[name=contact-form] textarea').focus();
          jQuery("form[name=contact-form] input[value='']:not(:checkbox,:button):visible:first").focus();
        }, 500);
      };
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
      } else {
        $scope.messages = {};
      }


      $scope.getDay = function (timestamp) {
        return Contact.getDay(timestamp);
      };


      $scope.askQuestion = function () {
        $scope.chatdisabled = true;
        Contact.askQuestion($scope.contact).then(function (messages) {
          $scope.messages = messages;
          Modal.messageReceived();
          $scope.contact.message = '';
          $scope.chatdisabled = false;
        });
      };
      }])
    .factory('Contact', ['$q', '$http', 'CONFIG', 'User', 'Notification', '$timeout', '$rootScope', function ($q, $http, CONFIG, User, Notification, $timeout, $rootScope) {

      function getMessage(id, tenant, agent) {
        var d = $q.defer();
        var query = {};
        var fullMessages;
        if (id) {
          query.id = id;
        } else if (tenant) {
          query.user = tenant;
        } else if (agent) {
          query.user = agent;
        } else {
          d.resolve({});
        }
        $http.get(CONFIG.API_URL + '/getmessage', {
          params: query
        }).then(function (data) {
          if (data.data) {
            fullMessages = data.data;

            var subMessages = _.sortBy(fullMessages.messages, 'date');

            fullMessages.messages = subMessages;
          } else {
            fullMessages = {};
          }
          $timeout(function () {
            if(typeof $('.smaller-chat')[0] != 'undefined' ) {
                $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
            }
          }, 1000);
          d.resolve(fullMessages);
        }).catch(function () {
          d.resolve({});
        });
        return d.promise;
      }

      function getDay(timestamp) {

        return moment(timestamp, 'X').format('YYYY-MM-DD');
      }

      function cleanMessages(messages) {
        var d = $q.defer();
        var sendMessages = _.after(messages.messages.length, function () {
          var newMessage;
          newMessage = messages;
          newMessage.messages = cleanM;
          d.resolve(newMessage);
        });
        var cleanM = [];
        _.each(messages.messages, function (message) {
          if (_.isObject(message.booking)) {
            message.booking = message.booking.id;
          }
          if (_.isObject(message.property)) {

            message.property = message.property.id;
          }
          cleanM.push(message);
          sendMessages();
        });

        return d.promise;
      }

      function replyQuestion(fullMessage, message, booking) {
        $('#contact_submit_button').prop('disabled', true);
        Notification.info({
          message: '<span>Posting your message...</span>',
          delay: 2000
        });

        $timeout(function () {
          $('body .ui-notification').addClass('notification_message');
        }, 100);
        var d = $q.defer();
        var newMessage = {
          message: message,
          date: moment().unix(),
          manager: true,
          property: null,
          booking: booking
        };
        fullMessage.read = true;
        fullMessage.messages.push(newMessage);

        $http.post(CONFIG.API_URL + '/message/', fullMessage).then(function (message) {
          $('#contact_submit_button').prop('disabled', false);
          $timeout(function () {
            $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
            $('chat textarea:first').focus();
          }, 1000);
          d.resolve(message.data);
        });

        var booking='';
        var property='';
        _.each(fullMessage.messages, function (message) {
          if (message.booking !== undefined && message.booking !== null && message.booking.id !== undefined && message.booking.id !== null) {
            booking = message.booking.id;
          }
          if (message.property !== undefined && message.property !== null && message.property.unique !== undefined && message.property.unique !== null) {
            property = message.property.unique;
          }
        });

        var params = {
          language: $rootScope.language,
          message: fullMessage.id,
          property: property,
          booking: booking
        };

		var i=0;
		_.each(fullMessage.messages,function(msg){
			if(msg.manager){
				i++;
			}
		});

		/*
		* 2016-05-18 - Ajay
		* Email sent on manager's first reply and update last email time in user
		*/
  		if(i==1){
  			$timeout(function () {
  				$http.get(CONFIG.API_URL + /email/, {
  					params: params
  				});
  				$http.put(CONFIG.API_URL + '/users/'+fullMessage.user.id, {lastMessengerMail: Date.now()});
  			}, 1500);
  		}
        return d.promise;
      }

      function askQuestion(contact, manager, property, booking) {
        $('#contact_submit_button').prop('disabled', true);
        Notification.info({
          message: '<span>Posting your message...</span>',
          delay: 2000
        });

        $timeout(function () {
          $('body .ui-notification').addClass('notification_message');
        }, 100);
        var d = $q.defer();

        var newMessage = {
          message: contact.message,
          date: moment().unix(),
          manager: manager ? true : false,
          property: property ? property : null,
          booking: booking ? booking : null
        };

        var newUser = {
          "name": contact.name,
          "email": contact.email
        };
        var userID;

        User.getOne(contact.email, newUser).then(function (currentUser) {
          userID = currentUser;
          return currentUser;
        }).then(function () {
          if (!$rootScope.agent) {
            return User.autoLoginTenant(contact.email);
          }
          return true;
        }).then(function () {
          return getMessage(null, userID, null).then(function (data) {
            if (data.id) {
              var existingMessage = data;
              existingMessage.read = false;
              existingMessage.messages.push(newMessage);
              cleanMessages(existingMessage).then(function (cleanMessage) {
                return $http.put(CONFIG.API_URL + '/message/' + cleanMessage.id, cleanMessage);
              }).then(function () {
                return getMessage(null, userID, null);
              }).then(function (data) {
                $('#contact_submit_button').prop('disabled', false);
                $timeout(function () {
                  $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
                  $('chat textarea:first').focus();
                }, 1000);
                d.resolve(data);
              });

            } else {
              var fullMessage = {
                read: false,
                user: userID,
                messages: [newMessage]
              };
              cleanMessages(fullMessage).then(function () {
                return $http.post(CONFIG.API_URL + '/message/', fullMessage);
              }).then(function () {
                return getMessage(null, userID, null);
              }).then(function (data) {
                $('#contact_submit_button').prop('disabled', false);
                d.resolve(data);
              });
            }
          });
        });
        return d.promise;

      }

      function getUnread(options) {
        var d = $q.defer();
        $http.get(CONFIG.API_URL + '/getmessage', {
          params: {
            //read: false,
            $skip: options.skip || 0,
            $limit: options.limit || 25,
            $sort: options.sort || {}
          }
        }).then(function (data) {

          d.resolve(data.data);
        }).catch(function () {
          d.resolve([]);
        });

        return d.promise;
      }

      function getUnreadCount() {
        var d = $q.defer();
        $http.get(CONFIG.API_URL + '/message/count', {
          params: {
            read: false
          }
        }).then(function (data) {
          d.resolve(data.data.count);
        }).catch(function () {
          d.resolve([]);
        });

        return d.promise;
      }

		function delAllMsg(data) {
			var d = $q.defer();
			$http.post(CONFIG.API_URL + '/deleteall',data).then(function (data) {
			  d.resolve(data);
			}).catch(function (e) {
			  d.reject(e);
			});
			return d.promise;
		}
		function deleteMessage(data) {
			var d = $q.defer();
			$http.delete(CONFIG.API_URL + '/message/'+data).then(function (data) {
			  d.resolve(data);
			}).catch(function (e) {
			  d.reject(e);
			});
			return d.promise;
		}

       function getAllMessages() {
        var d = $q.defer();
        $http.get(CONFIG.API_URL + '/message', {}).then(function (data) {
          d.resolve(data.data);
        }).catch(function () {
          d.resolve([]);
        });

        return d.promise;
      }

	  function latestUnread(message) {
        var m = _.sortBy(message.messages, 'date');
        //m = m.reverse();
        var index = _.findLastIndex(m, {
          manager: false
        });

        return m[index];
      }

	  function readMessage(id) {
		return $http.put(CONFIG.API_URL + '/message/'+id, {read:true});
      }

      return {
        getMessage: getMessage,
        getAllMessages: getAllMessages,
        askQuestion: askQuestion,
        cleanMessages: cleanMessages,
        getDay: getDay,
        getUnread: getUnread,
        replyQuestion: replyQuestion,
        getUnreadCount: getUnreadCount,
        latestUnread: latestUnread,
        deleteAllMessage: delAllMsg,
        delete: deleteMessage,
        readMessage: readMessage
      };

          }])
    .directive('chat', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/thaihome/contact/chat.html');
        }
      };
  }]);
})();
