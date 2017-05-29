(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('management.message', {
          url: 'message/:id/',
          css: ['/css/admin.css'],
          controller: 'ManagerMessageCtrl',
          title: 'title_management_properties',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/management/message/index.html');
          },
          resolve: {
            Message: ['Contact', '$stateParams', '$q', function (Contact, $stateParams, $q) {
              var d = $q.defer();
              Contact.getMessage($stateParams.id).then(function (data) {
                d.resolve(data);
				if(!data.read){ // When open message its set to read
					Contact.readMessage($stateParams.id);
				}
              });
              return d.promise;
            }]
          }
        });
    }])
    .controller('ManagerMessageCtrl', ['Message', 'Contact', '$stateParams', '$scope','$timeout','User',
     function (Message, Contact, $stateParams, $scope,$timeout, User) {
          $scope.messages = Message;
          $scope.agentExist = false;
         $scope.contact = Message.user;
          $scope.propertyToShow = '';

          if( typeof $scope.messages.messages[$scope.messages.messages.length - 1].booking == 'object'
              && $scope.messages.messages[$scope.messages.messages.length - 1].booking != null){
            $scope.currentBookingId = $scope.messages.messages[$scope.messages.messages.length - 1].booking.id;
            if($scope.messages.messages[$scope.messages.messages.length - 1].booking.agent != ''){
              $scope.agentExist = true;
                User.getDetails($scope.messages.messages[$scope.messages.messages.length - 1].booking.user).then(function(data){
                    console.log(data,'user detailes');
                    $scope.messages.user = data;
                    $scope.contact = $scope.messages.user;

                });
              User.getDetails($scope.messages.messages[$scope.messages.messages.length - 1].booking.agent).then(function(data){
                  console.log(data,'agent detailes');
                  $scope.agentData = data;
                });
            }
          }

          if(typeof $scope.messages.messages[$scope.messages.messages.length - 1].property == 'object'
              && $scope.messages.messages[$scope.messages.messages.length - 1].property != null){
            $scope.propertyToShow = $scope.messages.messages[$scope.messages.messages.length - 1].property.unique
          }


          console.log('booking id: ', $scope.currentBookingId);
          console.log('messages', $scope.messages);
    	  $timeout(function () {
    		$('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
    	  }, 1000);

          $scope.lastUnread = Contact.latestUnread($scope.messages);

          $scope.getDay = function (timestamp) {
            return Contact.getDay(timestamp);
          };


    	  /**
    	   * 2016-06-02 - Ajay - When manager reply first get message thread and then add new message fuckin' idiot
    	   **/
          $scope.askQuestion = function () {
        		Contact.getMessage($stateParams.id).then(function (data) {
        			Contact.replyQuestion(data, $scope.contact.message, $scope.currentBookingId).then(function (messages) {
                Contact.getMessage($stateParams.id).then(function (data) {
                  $scope.messages = data;
                });
        				console.log('messages', $scope.messages);
        				//$scope.messages = messages;
        				$scope.contact.message = '';
        			});
        		});
          };

  }]);
})();
