(function () {
  'use strict';
  angular.module('ThaiHome')
    .controller('GalleryCtrl', ['$scope', function ($scope) {
      $scope.width = 59;
      $scope.modalHeight = 555 + parseInt($scope.images.length / 12) * 110;
      // initial image index
      $scope._Index = 0;

      $scope.$watch('_Index', function () {
        $('#photogallery .nav').css('left', '-' + $scope._Index * $scope.width + 'px');
      });

      // if a current image is the same as requested image
      $scope.isActive = function (index) {
        return $scope._Index === index;
      };

      // show prev image
      $scope.showPrev = function () {
        $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.images.length - 1;
      };

      // show next image
      $scope.showNext = function () {
        $scope._Index = ($scope._Index < $scope.images.length - 1) ? ++$scope._Index : 0;

      };

      // show a certain image
      $scope.showPhoto = function (index) {
        $scope._Index = index;
      };

      $scope.initSpace = function () {
        $(document).bind('keydown', 'space', function (evt) {
          $(this).find('.nextimg').click();
          evt.preventDefault();
          return false;
        });
      };
    }]);
})();