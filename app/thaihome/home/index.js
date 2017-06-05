  export default function ($state, $rootScope, $interval, $http, $scope, $sce, $timeout) {
    var vm = this;
    $scope.headerSlider = function () {
      $http({
        method: "GET",
        url: "http://localhost:3001/frontpage/getFrontpage"
      }).then(function successCallback(data) {
        // Set  Image for slide 
        vm.images = data.data.data.featured;
        //Set new sope
        $scope.news = data.data.data.news;

        //Make text funtion
        $scope.deliberatelyTrustDangerousSnippet = function (text) {
          return $sce.trustAsHtml(text);
        };

        //Date time bar
        $rootScope.$on("datesChanged", function (event, dates) {
          $scope.checkin = dates.checkin;
          $scope.checkout = dates.checkout;
        })

        //Begin slider load image from public/img/rotator + imagename
        $('.home-bg img').attr('src', '/img/rotator/' + vm.images[0].image);
        for (var i = 0; i < vm.images.length; i++) {
          $('body').append('<img src="/img/rotator/' + vm.images[i].image + '" style="display:none"/>');
        }
        if ($rootScope.rotator != true) {
          var key = 1;
          $rootScope.rotator = true;
          var slider = $interval(function () {
            $('.home-bg img').animate({
              opacity: 0.5
            }, '500', function () {
              $(this)
                .attr('src', '/img/rotator/' + vm.images[key].image)
                .animate({
                  opacity: 1
                }, '100');
            });
            key++;
            if (key == vm.images.length) {
              key = 0
            }
          }, 10000);
        }

        vm.properties = [{
          "unique":"ATL-D406"
        }];
        $scope.HotDeals = {
          "properties": data.data.data.hotdeal,
          // "prices": data.data.prices,
          // "hotdeals": data.data.hotdeals,
          // "translations": data.data.translations
        };
      });
    }

  }