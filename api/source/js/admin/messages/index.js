/**
* 2016-05-17 - Ajay
* MessagesCtrl - Controller for Messages Page at admin
* Where Admin can delete all messages
**/
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.messages', {
          url: 'messages/',
          css: '/css/admin.css',
          controller: 'MessagesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/messages/index.html');
          },
          resolve: {
            Messages: ['Contact', '$q', function (Contact, $q) {
				var d = $q.defer();
				Contact.getAllMessages().then(function (data) {
					d.resolve(data);
				});
				return d.promise;
            }]
          }
        });
    }])
    .controller('MessagesCtrl', ['$scope', '$state', '$rootScope', 'Modal', 'Calendar', '$timeout', '$http', 'CONFIG', 'Notification', 'Property', 'Locale', 'Messages', 'DTOptionsBuilder','vcRecaptchaService','Contact', function ($scope, $state, $rootScope, Modal, Calendar, $timeout, $http, CONFIG, Notification, Property, Locale, Messages, DTOptionsBuilder,vcRecaptchaService,Contact) {
		$scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
		$scope.messages = Messages;
	  
	  /*** SYN- For Delete All Bookings ***/
		
		$scope.publicKey = CONFIG.PUBLIC_KEY;
		$scope.selected = {};
		$scope.selectAll = false;
		$scope.disabled = true;
	
		$scope.toggleAll = toggleAll;
		$scope.toggleOne = toggleOne;
	  
		function toggleAll (selectAll, selectedItems) {
			for (var id in selectedItems) {
				if (selectedItems.hasOwnProperty(id)) {
					selectedItems[id] = selectAll;
				}
			}			
		}
		function toggleOne (selectedItems) {
			for (var id in selectedItems) {
				if (selectedItems.hasOwnProperty(id)) {
					if(!selectedItems[id]) {
						$scope.selectAll = false;
						return;
					}
				}
			}
			$scope.selectAll = true;
		}
		
		angular.forEach(Messages, function(m){
			$scope.selected[m.id] = false;
		});
		
		 $scope.verifyCallback = function(response){
			$scope.disabled = false;
		};
		
		 $scope.expiredCallback = function(response) {
			$scope.disabled = true;
		};
	  
		$scope.deleteSelected = function (deleteStatus) {
			if(vcRecaptchaService.getResponse() === ""){
				alert("Please resolve the captcha and delete message!")
			}else{
				if(deleteStatus){
					$(".page-loading").removeClass("hide");	
					var data = {'Event':'DELETE', 'Type':'All', 'Collection':'message'};
					Contact.deleteAllMessage(data).then(function(){
						Notification.success({
							message: 'All Messages Deleted !'
						});
						$state.go('admin.messages', {}, {
							reload: true
						});
					}).catch(function (err) {
						if (err.data && err.data.errors) {
							Notification.error({
								message: JSON.stringify(err.data.errors)
							});
							 $(".page-loading").addClass("hide");
						} else {
							Notification.error({
								message: JSON.stringify(err.data)
							});
							 $(".page-loading").addClass("hide");
						}
					});
				}else{	
					var ids = [];
					 $(".page-loading").removeClass("hide");	
					angular.forEach($scope.selected, function(status,id){
						if(status==true){
							ids.push(id);
						}						
					});
					if(ids.length>0){
						var data = {'Event':'DELETE', 'Type':'Selected', 'ids':ids, 'Collection':'message'};
						Contact.deleteAllMessage(data).then(function () {
							Notification.success({
								message: 'Selected Messages Deleted !'
							});
							$state.go('admin.messages', {}, {
								reload: true
							});
						}).catch(function (err) {
							if (err.data && err.data.errors) {
								Notification.error({
									message: JSON.stringify(err.data.errors)
								});
								 $(".page-loading").addClass("hide");
							}else{
								Notification.error({
									message: JSON.stringify(err.data)
								});
								 $(".page-loading").addClass("hide");
							}
						});
					}else{
						alert("Please select message for delete!");
						$(".page-loading").addClass("hide");						
					}			
				}				
			}
		};
		
		/*** For Checkbox End ***/

      $scope.messages = Messages;

      $scope.delete = function (id) {
        Contact.delete(id).then(function () {
          Notification.success({
            message: 'Message Deleted !'
          });
          $state.go('admin.messages', {}, {
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
    }]);
})();