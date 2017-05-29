(function () {
  'use strict';
  angular.module('ThaiHome')
    .controller('AuthCtrl', ["$scope", "Auth", function ($scope, Auth) {
      $scope.credentials = {
        "email": "",
        "password": ""
      };

      $scope.login = function () {
        Auth.login($scope.credentials);
      };
    }])
    .factory('Auth', ['$http', 'User', 'CONFIG', '$q', '$rootScope', 'Email', '$timeout', 'dpd', function ($http, User, CONFIG, $q, $rootScope, Email, $timeout, dpd) {

      function checkToken(token) {
        var d = $q.defer();
        $http.get(CONFIG.API_URL + '/users', {
          params: {
            token: token
          }
        }).then(function (data) {
          if (data.data.length) {
            d.resolve(data.data[0]);
          } else {
            d.reject();
          }
        }).catch(function () {
          d.reject();
        });

        return d.promise;
      }

      function loginAgent(email, password) {
        var d = $q.defer();
        $http.post(CONFIG.API_URL + '/users/login', {
          "username": email.toLowerCase(),
          "password": password
        }).then(function (data) {
          return data;
        }).then(function (data) {
          return User.getDetails(data.data.uid);
        }).then(function (data) {
          var token = genToken();
          localStorage.setItem('auth', token);
          localStorage.removeItem('agent');
          data.auth = token;
          return $http.post(CONFIG.API_URL + '/users', data);
        }).then(function (data) {
          if (data.data.type === 'agent') {
            $rootScope.agent = data.data;
            d.resolve(data.data);
          } else {
            logout();
            d.reject();
          }
        }).catch(function (err) {
          d.reject(err);
        });

        return d.promise;
      }

      function loginAdmin(email, password) {
        var d = $q.defer();
        $http.post(CONFIG.API_URL + '/users/login', {
          "username": email.toLowerCase(),
          "password": password
        }).then(function (data) { 
          return data;
        }).then(function (data) {
          return User.getDetails(data.data.uid);
        }).then(function (data) {
          var token = genToken();
          localStorage.setItem('auth', token);
          data.auth = token;
          return $http.post(CONFIG.API_URL + '/users', data);
        }).then(function (data) {
          if (data.data.type === 'admin' || data.data.type === 'translator') {
            $rootScope.admin = data.data;
            d.resolve(data.data);
          } else {
            logout();
            d.reject();
          }
        }).catch(function (err) {
          d.reject(err);
        });

        return d.promise;
      }


      function forgotPassword(email) {
        var d = $q.defer();
        User.getDetails(false, email).then(function (data) {
          if (data.type === 'tenant') {
            d.reject();
          } else {
            var token = '';
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 40; i++) {
              token += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            data.token = token;
            return data;
          }
        }).then(function (data) {
          return User.update(data.id, data);
        }).then(function (data) {
          var params = {
            to: data.email,
            token: data.token,
            language: $rootScope.language,
            subject: 'Your password reset request'
          };
          return Email.send('forgot_password', params);
        }).then(function () {
          d.resolve();
        }).catch(function (e) {
          d.reject();
        });

        return d.promise;
      }

      function logout() {
        var d = $q.defer();
        localStorage.removeItem('auth');
        $http.post(CONFIG.API_URL + '/users/logout').then(function (data) {
          $rootScope.agent = false;
          $rootScope.admin = false;
          d.resolve(data);
        }).catch(function (err) {
          d.reject(err);
        });

        return d.promise;
      }

      function genToken() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 20; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
      }

      function checkLogged() {
        var d = $q.defer();
        var token = localStorage.getItem('auth');
        if (token != null) {
          $http.get(CONFIG.API_URL + '/users', {
            params: {
              auth: token
            }
          }).then(function (data, err) {
            if (data.data.length) {
              if (data.data[0].type === 'agent') {
                $rootScope.agent = data.data[0];
              } else if (data.data[0].type === 'admin') {
                $rootScope.admin = data.data[0];
              }
              d.resolve({
                data: data.data[0]
              });
            } else {
              d.resolve({
                data: {}
              });
            }
          });
        } else {
          dpd.users.get('me', function (data, error) {
            if (data && _.isObject(data)) {
              if (data.type === 'agent') {
                $rootScope.agent = data;
              } else if (data.type === 'admin') {
                $rootScope.admin = data;
              }
              d.resolve({
                data: data
              });
            } else {
              d.resolve({
                data: {}
              });
            }
          });
        }

        return d.promise;
      }
      return {
        loginAgent: loginAgent,
        logout: logout,
        checkLogged: checkLogged,
        forgotPassword: forgotPassword,
        checkToken: checkToken,
        loginAdmin: loginAdmin,
        genToken: genToken
      };
    }]);
})();