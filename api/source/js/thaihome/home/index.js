(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('home', {
                url: '/',
                title: 'title_home',
                css: '/css/style.css',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/thaihome/home/index.html');
                },
                controller: 'HomeCtrl',
                resolve: {
                    CurrentNews: ['News', '$q', function (News, $q) {
                        var deferred = $q.defer();
                        News.getNews().then(function (data) {
                            deferred.resolve(data);
                        }).catch(function (err) {
                            deferred.reject(err, 404);
                        });
                        return deferred.promise;
                    }],
                    // CurrentHotDeals: ["HotDeals", "$q", function (HotDeals, $q) {
                    //     var deferred = $q.defer();
                    //     HotDeals.getDeals().then(function (data) {
                    //         deferred.resolve(data);
                    //     }).catch(function (err) {
                    //         deferred.reject(err, 404);
                    //     });
                    //     return deferred.promise;
                    // }],
                    Locations: ["$q", "$http", "CONFIG", function ($q, $http, CONFIG) {
                        var deferred = $q.defer();
                        $http.get(CONFIG.API_URL + '/location').then(function (data) {
                                deferred.resolve(data);
                            })
                            .catch(function (err) {
                                deferred.reject(err, 404);
                            });
                        return deferred.promise;
                    }],
                }
            })
        }])
        .controller('HomeCtrl', ['$state', 'CurrentNews', '$rootScope', '$interval', '$http', 'Calendar', '$scope', 'CONFIG', 'Locations', 'Locale', '$sce', 'HotDeals', '$timeout',
            function ($state, CurrentNews, $rootScope, $interval, $http, Calendar, $scope, CONFIG, Locations, Locale, $sce, HotDeals, $timeout) {

                var dates = Locale.getDates();
                if (dates.valid) {
                    $scope.checkin = dates.checkin;
                    $scope.checkout = dates.checkout;
                }

                $http({
                    method: "GET",
                    url: CONFIG.HELPER_URL + "/news/getNewsForHomePage"
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


                Calendar.loadCalendar();

                function getDeals() {
                    console.log(' get deals ff ; : ', localStorage.getItem('locale'));
                    if (localStorage.getItem('locale') == null) {
                        console.log(" NEW QUERY FOR DEASL ::");
                        $timeout(function () {
                            getDeals()
                        }, 1000)
                    } else {
                        HotDeals.getDeals().then(function (data) {
                            // console.log(" DATA FROM deals : ", data);
                            //console.log("Price : ",data.data.prices);
                            //New Function add price to data.data.price
                            angular.forEach(data.data.prices, function (value, key) {
                                //loop find price 
                                var start = new Date(); //start date
                                var end = new Date();
                                end.setDate(end.getDate() + 1); //end date
                                var url = CONFIG.HELPER_URL + "/price/getPrice/";
                                var connect = {
                                    method: 'POST',
                                    url: url,
                                    data: {
                                        "propertyID": key,
                                        "checkin": Date.parse(start) / 1000,
                                        "checkout": Date.parse(end) / 1000
                                    }
                                }
                                $http(connect).then(function (response) {
                                    console.log(response.data.priceFindResult);
                                    value.price.push({
                                        property: key,
                                        season: "base",
                                        priceDay: response.data.priceFindResult.priceNight
                                    });
                                }, function (err) {
                                    console.log(err);
                                });

                            })
                            $scope.HotDeals = {
                                "properties": data.data.properties,
                                "prices": data.data.prices,
                                "hotdeals": data.data.hotdeals,
                                "translations": data.data.translations
                            };
                        });
                    }
                }

                getDeals();


                $scope.locations = Locations.data;

                $scope.headerSlider = function () {

                    $http.get(CONFIG.API_URL + "/featured")
                        .success(function (response) {
                            var images = response;
                            $('.home-bg img').attr('src', '/assets/images/rotator/' + images[0].image);
                            for (var i = 0; i < images.length; i++) {
                                $('body').append('<img src="/assets/images/rotator/' + images[i].image + '" style="display:none"/>');
                            }
                            if ($rootScope.rotator != true) {
                                var key = 1;
                                $rootScope.rotator = true;
                                var slider = $interval(function () {
                                    $('.home-bg img').animate({
                                        opacity: 0.5
                                    }, '500', function () {
                                        $(this)
                                            .attr('src', '/assets/images/rotator/' + images[key].image)
                                            .animate({
                                                opacity: 1
                                            }, '100');
                                    });
                                    key++;
                                    if (key == images.length) {
                                        key = 0
                                    }
                                }, CONFIG.HOME_IMAGE_TIMEOUT);
                            }

                        });

                }

                $scope.search = function () {
                    //Moment Error fix

                    if (!$scope.checkin || !$scope.checkout) {
                        $scope.checkin = moment().add(30, 'days').format("MMM D, YYYY");
                        $scope.checkout = moment().add(37, 'days').format("MMM D, YYYY");
                        localStorage.setItem('checkin', moment().add(30, 'days').format("MMM D, YYYY"));
                        localStorage.setItem('checkout', moment().add(37, 'days').format("MMM D,  YYYY"));
                        $('.arrival, .departure').data('dateRangePicker').setDateRange($scope.checkin, $scope.checkout);

                        $scope.search();
                    }

                    $state.go('search', {
                        "location": $scope.location ? $scope.location : 0
                    });
                }

            }
        ])
})();