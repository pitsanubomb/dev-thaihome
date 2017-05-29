(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('agent_register', {
                url: '/agent/register/',
                controller: 'AgentRegisterCtrl',
                title: 'title_agent_login',
                css: '/css/style.css',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/agent/register/index.html');
                },
                resolve: {
                    Agent: ['Auth', '$q', '$state', function (Auth, $q, $state) {
                        var d = $q.defer();
                        Auth.checkLogged().then(function (data) {
                            if (data.type === 'agent') {
                                $state.go('agent.home');
                                d.resolve(data);
                            } else {
                                d.resolve();
                            }
                        }).catch(function () {
                            d.resolve();
                        });

                        return d.promise;
                    }]
                }
            });
        }])
        .controller('AgentRegisterCtrl', ['User', '$scope', 'Modal','$http','CONFIG', function (User, $scope, Modal, $http, CONFIG) {

            $http.get(CONFIG.HELPER_URL + '/users/getAdminsAndManagersAndTranslators', {}).then(function (res) {
                console.log("DATA FROM ADMINS", res);
                $scope.userList = res.data.data;
            });

            $scope.compareUserInfo = function (email) {
                if (typeof $scope.userList != 'undefined') {
                    var user = $scope.userList.filter(function (obj) {
                        return obj.email == email;
                    });
                    if (user.length) {
                        console.log('user type : ', user[0].type);
                        if (user[0].type == "admin" || user[0].type == "translator") {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            };


            $scope.register = function () {
                var newAgent = {

                    name: $scope.data.name,
                    agent: $scope.data.name,
                    agency: $scope.data.agency,
                    email: $scope.data.email,
                    password: $scope.data.password,
                    phone: $scope.data.phone,
                    website: $scope.data.website,
                    line_messenger: $scope.data.line_messenger,
                    whatsapp: $scope.data.whatsapp,
                    facebook: $scope.data.facebook,
                    type: 'agent',
                    username: $scope.data.username
                };

                User.add(newAgent).then(function () {
                    $scope.disabled = true;
                    Modal.newAgent();
                }).catch(function (error) {
                    var errMsg = '';
                    for (var i in error.data.errors) {
                        errMsg += i + ' ' + error.data.errors[i];
                    }
                    //$scope.error = error.data.errors;
                    $scope.error = errMsg;
                });
            };

        }]);
})();