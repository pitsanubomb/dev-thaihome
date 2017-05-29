(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('management.bookings', {
                    url: 'bookings/',
                    controller: 'ManagementBookingsCtrl',
                    title: 'title_management_bookings',
                    css: ['/css/admin.css'],
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/management/bookings/index.html');
                    },
                    params: {
                        bookingType: 0,
                    },
                    resolve: {
                        Bookings: ['Booking', '$q', '$rootScope', '$stateParams', function (Booking, $q, $rootScope, $stateParams) {
                            var d = $q.defer();
                            Booking.findManagementOld({
                                status: parseInt($stateParams.bookingType)
                            }).then(function (data) {
                                d.resolve(data.data);
                            }).catch(function () {
                                d.resolve([]);
                            });
                            return d.promise;
                        }]
                    }
                });
        }])
        .controller('ManagementBookingsCtrl', ['Bookings', 'Notification', '$state', 'Booking', '$stateParams', '$scope', 'DTOptionsBuilder', function (Bookings, Notification, $state, Booking, $stateParams, $scope, DTOptionsBuilder) {
            $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('iDisplayLength', 50);
            $scope.bookings = Bookings;
            $scope.bookingType = $stateParams.bookingType.toString();
            // Booking.find().then(function (res) {
            //     $scope.extendedBooking = res.data;
            // });

            $scope.extendedBooking = $scope.bookings;



            $scope.getExpDatebyID = function (id) {
                if (typeof $scope.extendedBooking != 'undefined' && $scope.extendedBooking.length) {
                    var current = $scope.extendedBooking.filter(function (obj) {
                        return obj.id == id;
                    });
                    return current[0].expires * 1000;
                }
            }

            $scope.getDueDateForInvoice = function (DD) {
                var days = Math.round((Math.round(new Date(DD) / 1000) - Math.round(new Date() / 1000)) / 86400);
                if (days < 0) {
                    return {days: days, color: "red-color"};
                } else if (days == 0) {
                    return {days: days, color: "black-color"};
                } else {
                    return {days: days, color: "green-color"};
                }
            };

            $scope.getSourceOfBooking = function (id) {
                if (typeof $scope.extendedBooking != 'undefined' && $scope.extendedBooking.length) {
                    var current = $scope.extendedBooking.filter(function (obj) {
                        return obj.id == id;
                    });
                    return current[0].source;
                }
            };

            $scope.getStatus = function (status) {
                return Booking.getStatus(status);
            };

            $scope.statuses = Booking.getStatus(false, true);

            $scope.selected = [];

            $scope.query = {
                filter: '',
                order: 'checkin',
                page: 1
            };

            $scope.selectBooking = function () {
                Notification.success({
                    message: 'Loading...'
                });
                if ($scope.bookingType === 'old') {
                    var when = moment().add(-14, 'day').format('x');
                    var query = {
                        status: {
                            $in: [0, 1, 2]
                        },
                        created: {
                            $lte: when
                        }
                    };
                    Booking.find(query).then(function (data) {
                        $scope.bookings = data.data;
                    });
                } else if ($scope.bookingType === 'all') {
                    Booking.find({}).then(function (data) {
                        $scope.bookings = data.data;
                    });
                } else {
                    var type = parseInt($scope.bookingType);
                    $state.go('management.bookings', {
                        bookingType: type
                    }, {
                        reload: true,
                        notify: true
                    });
                }

            };

        }]);
})();
