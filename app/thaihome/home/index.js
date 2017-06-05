  export default function ($state, $rootScope, $interval, $http, $scope, $sce, $timeout) {

    $http({
      method: "GET",
      url: "http://localhost:3001/news/getNewsForHomePage"
    }).then(function (data) {
      $scope.news = data.data.news;
    });

    $scope.deliberatelyTrustDangerousSnippet = function (text) {
      return $sce.trustAsHtml(text);
    };

    $rootScope.$on("datesChanged", function (event, dates) {
      $scope.checkin = dates.checkin;
      $scope.checkout = dates.checkout;
    })

    $scope.headerSlider = function () {

      $http({
        method: "GET",
        url: "http://localhost:3000/api/featured"
      }).then(function (response) {
        var images = response.data;
        $('.home-bg img').attr('src', '/img/rotator/' + images[0].image);
        for (var i = 0; i < images.length; i++) {
          $('body').append('<img src="/img/rotator/' + images[i].image + '" style="display:none"/>');
        }
        if ($rootScope.rotator != true) {
          var key = 1;
          $rootScope.rotator = true;
          var slider = $interval(function () {
            $('.home-bg img').animate({
              opacity: 0.5
            }, '500', function () {
              $(this)
                .attr('src', '/img/rotator/' + images[key].image)
                .animate({
                  opacity: 1
                }, '100');
            });
            key++;
            if (key == images.length) {
              key = 0
            }
          }, 10000);
        }
      });
    }

  }