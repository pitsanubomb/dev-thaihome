(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.emails', {
          url: 'emails/',
          css: '/css/admin.css',
          controller: 'EmailsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/emails/index.html');
          },
          resolve: {
            Emails: ['Email', '$q', function (Email, $q) {
              var d = $q.defer();
              Email.list().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            EmailData: function () {
              return {};
            }
          }
        })
        .state('admin.emails.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'EmailsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/emails/view.html');
          },
          resolve: {
            Emails: function () {
              return [];
            },
            EmailData: ['$http', '$q', '$stateParams', 'CONFIG', function ($http, $q, $stateParams, CONFIG) {
              var d = $q.defer();
              $http.get(CONFIG.API_URL + '/emails/', {
                params: {
                  value: $stateParams.id
                }
              }).then(function (data) {
                d.resolve(data.data[0]);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.emails.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'EmailsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/emails/view.html');
          },
          resolve: {
            Emails: function () {
              return [];
            },
            EmailData: function () {
              return {};
            }
          }
        })
		.state('admin.emails.signature', {      // 2016-05-17 - Ajay - Create link in admin emails page for update default signature
          url: 'signature/',
          css: '/css/admin.css',
          controller: 'EmailsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/emails/signature.html');
          },
          resolve: {
            Emails: function () {
              return [];
            },
            EmailData: ['$http', '$q', '$stateParams', 'CONFIG', function ($http, $q, $stateParams, CONFIG) {
              var d = $q.defer();
              $http.get(CONFIG.API_URL + '/emails/', {
                params: {
                  value: 'signature'
                }
              }).then(function (data) {
                d.resolve(data.data[0]);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
			}]
          }
        });
      }])
    .controller('EmailsCtrl', ['Emails', '$stateParams', '$scope', '$state', 'Email', 'EmailData', 'DTOptionsBuilder', 'Notification', 'Modal', '$rootScope', 'CONFIG', 'Calendar', '$timeout', '$http', function (Emails, $stateParams, $scope, $state, Email, EmailData, DTOptionsBuilder, Notification, Modal, $rootScope, CONFIG, Calendar, $timeout, $http) {
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.emails = Emails;

      $scope.email = EmailData;

      $scope.viewTags = function () {
        Modal.tags();
      };

      $scope.delete = function (id) {
        $http.delete(CONFIG.API_URL + '/emails/' + id).then(function () {
          Notification.success({
            message: 'Email Deleted'
          });
          $scope.emails = _.without($scope.emails, _.findWhere($scope.emails, {
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
        var data = $scope.email;
        $http.post(CONFIG.API_URL + '/emails', data).then(function () {
          Notification.success({
            message: 'Email Modified'
          });
          $state.go('admin.emails', {}, {
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
		 
		$scope._signature = '';
		if($scope.email!=undefined && $scope.email.value!=undefined && $scope.email.value=='signature'){
			$scope._signature = $scope.email.html;
		}
		$scope.changeSignature = function () {			
			if($scope.email==undefined){
				var data = {"name":"Default Signature","value":"signature","html":$scope._signature};
				$http.post(CONFIG.API_URL + '/emails', data).then(function () {
				  Notification.success({
					message: 'Signature Modified!'
				  });
				  $state.go('admin.emails.signature', {}, {
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
			}else{
				var data = {"html":$scope._signature};
				$http.post(CONFIG.API_URL + '/emails/'+$scope.email.id, data).then(function () {
				  Notification.success({
					message: 'Signature Modified!'
				  });
				  $state.go('admin.emails.signature', {}, {
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
			}
		  };

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.emails', {}, {
          reload: true
        });
      };

  }]);
})();