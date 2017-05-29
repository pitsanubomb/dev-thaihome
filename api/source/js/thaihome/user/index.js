(function () {
    'use strict';
    angular.module('ThaiHome')
        .controller('UserCtrl', ["$scope", "Auth", function ($scope, Auth) {
            $scope.credentials = {
                "email": "",
                "password": ""
            };

            $scope.login = function () {
                Auth.login($scope.credentials);
            };


        }])
        .factory('User', ['$http', 'CONFIG', '$q', '$rootScope', 'Token', function ($http, CONFIG, $q, $rootScope, Token) {
            return {
                getAll: function (query) {
                    var d = $q.defer();
                    $http.get(CONFIG.API_URL + '/users', {
                        params: query
                    }).then(function (data) {
                        d.resolve(data.data);
                    }).catch(function (err) {
                        d.reject(err);
                    });

                    return d.promise;
                },
                add: function (data) {
                    var d = $q.defer();
                    data.created = moment().unix();
                    data.lastContact = moment().unix();
                    $http.post(CONFIG.API_URL + '/users', data).then(function (data) {
                        d.resolve(data);
                    }).catch(function (err) {
                        d.reject(err);
                    });
                    return d.promise;
                },
                update: function (id, data) {
                    var d = $q.defer();
                    $http.put(CONFIG.API_URL + '/users/' + id, data).then(function (data) {
                        d.resolve(data.data);
                    }).catch(function (e) {
                        d.reject(e);
                    });
                    return d.promise;
                },
                delete: function (id) {
                    var d = $q.defer();
                    $http.delete(CONFIG.API_URL + '/users/' + id).then(function (data) {
                        d.resolve(data);
                    }).catch(function (e) {
                        d.reject(e);
                    });
                    return d.promise;
                },
                getDetails: function (id, email) {
                    var d = $q.defer();
                    if (id) {
                        $http.get(CONFIG.API_URL + '/users/' + id).then(function (data) {
                            if (_.isObject(data.data) && data.data.id) {
                                d.resolve(data.data);
                            } else if (data.data.length) {
                                d.resolve(data.data[0]);
                            } else {
                                d.reject();
                            }
                            return d.promise;
                        });
                    } else if (email) {
                        $http.get(CONFIG.API_URL + '/users', {
                            params: {
                                email: email
                            }
                        }).then(function (data) {
                            if (_.isObject(data.data) && data.data.id) {
                                d.resolve(data.data);
                            } else if (data.data.length) {
                                d.resolve(data.data[0]);
                            } else {
                                d.reject();
                            }
                        });
                    } else {
                        d.reject();
                    }
                    return d.promise;

                },
                getOne: function (email, data, full) {
                    var d = $q.defer();
                    $http.get(CONFIG.API_URL + '/users', {
                        "params": {
                            "email": email
                        }
                    }).then(function (user) {

                        var token = Token.genToken();
                        if (user && user.data && user.data[0]) {
                            var update = user.data[0];
                            if (data.phone) update.phone = data.phone;
                            if (data.name) update.name = data.name;
                            if (data.country) update.country = data.country;
                            if (update.agent) update.agent = data.agent;
                            $http.put(CONFIG.API_URL + '/users/' + update.id, update);
                            /**
                             Start 2016-05-27 - Ajay - For logout issue
                             */
                            if (!$rootScope.admin) {
                                localStorage.setItem('auth', token);
                            }
                            /**
                             END
                             */
                            var updateUser = user.data[0];
                            updateUser.auth = token;
                            $http.put(CONFIG.API_URL + '/users/' + updateUser.id, updateUser).then(function () {
                                if (full) {
                                    d.resolve(user.data[0]);
                                } else {
                                    d.resolve(user.data[0].id);
                                }
                            }).catch(function () {
                                d.resolve(false);
                            });

                        } else if (data) {
                            var newUser = {
                                "email": data.email,
                                "password": data.email,
                                "name": data.name,
                                "phone": data.phone,
                                "country": data.country,
                                "agent": data.agent ? data.agent : '',
                                "username": data.email,
                                "created": moment().unix(),
                                "lastContact": moment().unix(),
                                "type": "tenant",
                                "auth": token
                            };
                            localStorage.setItem('auth', token);
                            $http.post(CONFIG.API_URL + '/users', newUser).then(function (newuser) {
                                if (full) {
                                    d.resolve(newuser.data);
                                } else {
                                    d.resolve(newuser.data.id);
                                }
                            });
                        } else {
                            d.resolve(false);
                        }
                    }).catch(function (err) {
                        d.reject(err);
                    });
                    return d.promise;
                },
                autoLoginTenant: function (email) {
                    var d = $q.defer();
                    $http.post(CONFIG.API_URL + '/users/login', {
                        "username": email,
                        "password": email
                    }).then(function () {
                        d.resolve();
                    }).catch(function () {
                        d.resolve();
                    });
                    return d.promise;
                },
                userTypes: function () {
                    return [
                        {
                            value: 'tenant',
                            text: 'tenant'
                        },
                        {
                            value: 'agent',
                            text: 'agent'
                        },
                        {
                            value: 'admin',
                            text: 'admin/manager'
                        },
                        {
                            value: 'translator',
                            text: 'translator'
                        }
                    ];

                }
            };
        }]);
})();