/**
* 2016-05-17 - Ajay
* ManagerProfileCtrl - Controller for Profile Page
* Where manager update there signature.
**/
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('management.profile', {
          url: 'profile/',
          css: ['/css/admin.css'],
          controller: 'ManagerProfileCtrl',
          title: 'title_management_profile',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/management/profile/index.html');
          }
        });
    }])
    .controller('ManagerProfileCtrl', ['User', '$stateParams', '$scope', '$state', '$rootScope', 'Notification', function ( User, $stateParams, $scope, $state, $rootScope, Notification) {
		$scope._signature = $rootScope.admin.signature
		
	$scope.update = function () {        
        var user = {
          "signature": $scope._signature          
        };

        User.update($rootScope.admin.id, user).then(function () {
			Notification.success({
				message: 'Signature Updated !'
			});
			$state.go('management.profile', {}, {
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