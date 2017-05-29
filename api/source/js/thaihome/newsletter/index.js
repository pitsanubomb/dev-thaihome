(function () {
  'use strict';
  angular.module('ThaiHome')
    .controller('Newsletter', ['CONFIG', 'Modal', '$scope', '$http', function (CONFIG, Modal, $scope, $http) {
      $scope.add = function () {
        $http.post(CONFIG.API_URL + "/newsletter", {
            email: $scope.email,
            added: moment().unix()
          })
          .success(function (response) {
            if (response.message === 'duplicate') {
              Modal.default('Your email already exists in our newsletter list.');
              $scope.email = '';
            } else {
              Modal.default('Your email has been added to our newsletter list.');
              $scope.email = '';
            }

          });
      }
    }])
})();