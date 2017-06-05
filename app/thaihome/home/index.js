  import Locale from '../locale/'
  export default function ($state, $rootScope, $interval, $http, $scope, $sce, $timeout) {


    $http({
      method: "GET",
      url: "http://localhost:3001/news/getNewsForHomePage"
    }).then(function (data) {
      console.log(" NEWS DATA", data);
      $scope.news = data.data.news;
    });

    $scope.deliberatelyTrustDangerousSnippet = function (text) {
      return $sce.trustAsHtml(text);
    };

    $rootScope.$on("datesChanged", function (event, dates) {
      $scope.checkin = dates.checkin;
      $scope.checkout = dates.checkout;
    })


  }