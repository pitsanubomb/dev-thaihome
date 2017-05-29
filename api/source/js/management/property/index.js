(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('management.property', {
                url: 'property/:id/',
                title: 'title_property',
                css: '/css/admin.css',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/management/property/index.html');
                },
                controller: 'ManagementPropertyCtrl',
                resolve: {
                    PropertyData: ["Property", "$q", "$stateParams", function (Property, $q, $stateParams) {
                        var deferred = $q.defer();
                        Property.getDetails($stateParams.id).then(function (data) {
                            deferred.resolve(data);
                        }).catch(function (err) {
                            deferred.reject(err, 404);
                        });
                        return deferred.promise;
                    }]
                }
            });
        }])
        .controller('ManagementPropertyCtrl', ["PropertyData", "$timeout", "$scope", "$state", "Calendar", "Modal", '$http', 'CONFIG','$stateParams','Bookings',
            function (PropertyData, $timeout, $scope, $state, Calendar, Modal, $http, CONFIG, $stateParams,Bookings) {
                Calendar.loadCalendar(false, false, false, PropertyData.data.bookings);
                $scope.property = PropertyData.data.property;
                $scope.translation = PropertyData.data.translation;
                $scope.price = PropertyData.data.price;
                $scope.price.priceYear = Math.floor($scope.price.priceYear / 12);
                $scope.agentrentlink = $state.href('agent.property', {
                    id: $scope.property.unique
                }, {
                    absolute: true
                });

                $http.post(CONFIG.HELPER_URL + '/booking/getBookingsForProperty', {
                    "property": $scope.property.id,
                }).success(function (data) {
                    $scope.propertyBookings = data.bookings;
                    var userIds = [];
                    function sortingByCheckinDate(a,b) {
                        if (a.checkin < b.checkin)
                            return -1;
                        if (a.checkin > b.checkin)
                            return 1;
                        return 0;
                    }
                    $scope.propertyBookings.sort(sortingByCheckinDate);

                    for(var i = 0; i < $scope.propertyBookings.length; i++){
                        userIds.push($scope.propertyBookings[i].user);
                        $scope.propertyBookings[i].checkin = moment(new Date($scope.propertyBookings[i].checkin * 1000)).format('DD, MMMM YYYY');
                        $scope.propertyBookings[i].checkout = moment(new Date($scope.propertyBookings[i].checkout * 1000)).format('DD, MMMM YYYY');
                    }
                    $http.post(CONFIG.HELPER_URL + '/users/getUsersByMultipleIds', {
                        'ids':userIds
                    }).then(function(res){
                       console.log("USERS OF BOOKINGS :", res.data.data);
                       $scope.usersOfBookings = res.data.data;
                       $scope.getUserById = function(id){
                           var currentUser = $scope.usersOfBookings.filter(function(obj){
                              return obj._id == id;
                           })[0];
                           return currentUser.name;
                       }
                    });
                });

                $('.copy_btn').on('click', function(){
                    var data_id = document.querySelector('#data_id');
                    data_id.value = "";
                    // select the contents
                    data_id.value = this.getAttribute("data-text");
                    console.log(data_id.value);
                    data_id.select();
                    document.execCommand('copy'); // or 'cut'
                })




                $scope.booked = PropertyData.data.booked;

                $scope.rentlink = $state.href('property', {
                    id: $scope.property.unique
                }, {
                    absolute: true
                });
                $scope.salelink = $state.href('sale', {
                    id: $scope.property.unique
                }, {
                    absolute: true
                });

                $scope.openCalendar = function () {
                    $timeout(function () {
                        $('.arrival, .departure').data('dateRangePicker').open();
                    });
                };

                $scope.propertyDetails = function () {
                    Modal.propertyDetails($scope.property, $scope.translation, true);
                };
            }]);
})();