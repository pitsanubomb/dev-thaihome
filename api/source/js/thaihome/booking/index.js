(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('book', {
                    url: '/book/:id/:discount/:agent/',
                    title: 'title_book',
                    css: '/css/style.css',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/thaihome/book/index.html');
                    },
                    controller: 'BookCtrl',
                    resolve: {
                        check: ["Booking", "Locale", "$q", "$stateParams", "$state", "$location", function (Booking, Locale, $q, $stateParams, $state, $location) {
                            var d = $q.defer();
                            console.log("Send", $stateParams, "Book ", Booking);
                            Booking.check($stateParams.id).then(function (data) {
                                if (data) {
                                    console.log("test-book");
                                    d.reject();
                                } else {
                                    console.log("no-data", data);
                                    d.resolve();
                                }
                            });

                            return d.promise;

                        }],
                        Location: ['$q', 'IPLocation', function ($q, IPLocation) {
                            console.log("get-Location");
                            var d = $q.defer();
                            IPLocation.get().then(function (data) {
                                d.resolve(data);
                                console.log("location-data", data);
                            }).catch(function () {
                                d.resolve(null);
                            });
                            return d.promise;
                        }],
                        Agent: ['$q', 'User', 'Locale', function ($q, User, Locale) {
                            console.log("get-agent");
                            var d = $q.defer();
                            if (Locale.getAgent()) {
                                User.getDetails(Locale.getAgent()).then(function (data) {
                                    if (data.type === 'agent') {
                                        d.resolve(data);
                                    } else {
                                        d.resolve(false);
                                    }
                                }).catch(function () {
                                    d.resolve(false);
                                });
                            } else {
                                d.resolve(false);
                            }

                            return d.promise;
                        }],
                        currentUser: ['Auth', '$q', function (Auth, $q) {
                            var d = $q.defer();
                            Auth.checkLogged().then(function (data) {
                                d.resolve(data);
                            }).catch(function () {
                                d.resolve({});
                            });

                            return d.promise;
                        }],
                        Dates: ["$q", "Locale", "$state", "$location", function ($q, Locale, $state, $location) {
                            console.log("get-dates and path", localStorage.getItem('past-booking-id'));
                            if (localStorage.getItem('past-booking-id') != null) {
                                window.location.pathname = "/booking/" + localStorage.getItem('past-booking-id');
                            } else {
                                var d = $q.defer();
                                var dates = Locale.getDates();
                                console.log('set dates form local', dates);
                                if (dates.valid) {
                                    console.log("date.valid");
                                    d.resolve(dates);
                                    console.log("Reslove");
                                } else {
                                    /** Ajay - Check local booking id and redirect to booking page while refresh at second step. */
                                    if (localStorage.getItem('past-booking-id') && localStorage.getItem('past-booking-id') != '') {
                                        $location.path('/booking/' + localStorage.getItem('past-booking-id') + '/');
                                        d.resolve({});
                                    } else {
                                        d.reject();
                                    }
                                }
                                return d.promise;
                            }
                        }],
                        PropertyData: ["Property", "$q", "$stateParams", "$http", "CONFIG", "Locale", function (Property, $q, $stateParams, $http, CONFIG, Locale) {

                            var deferred = $q.defer();
                            var property;
                            Property.getDetails($stateParams.id).then(function (data) {
                                console.log("getDetails-data", data, $stateParams.id);
                                var property = data.data;
                                var dates = Locale.getDates();
                                $http.post(CONFIG.HELPER_URL + '/price/getPrice/', {

                                    "propertyID": property.property.id,
                                    "checkin": Date.parse(dates.checkin) / 1000,
                                    "checkout": Date.parse(dates.checkout) / 1000,

                                }).success(function (data) {
                                    // console.log("---------------------------Data is -------------", data)
                                    deferred.resolve({
                                        price: data.priceFindResult,
                                        property: property
                                    });
                                });

                            }).catch(function (err) {
                                deferred.reject(err, 404);
                            });
                            return deferred.promise;
                        }],
                        Ratings: ["Rating", "$q", "$stateParams", function (Rating, $q, $stateParams) {
                            var d = $q.defer();
                            Rating.getPropertyRatings($stateParams.id).then(function (data) {
                                d.resolve(data);
                            });
                            return d.promise;
                        }],
                        Message: ['Contact', '$q', 'Auth', function (Contact, $q, Auth) {
                            var d = $q.defer();
                            Auth.checkLogged().then(function (data) {
                                Contact.getMessage(null, data.data.id, null).then(function (data) {
                                    d.resolve(data);
                                }).catch(function () {
                                    d.resolve({
                                        data: []
                                    });
                                });
                            });

                            return d.promise;
                        }],
                        CountriesList: ['Countries', function (Countries) {
                            return Countries.list;
                        }]
                    }
                })
                .state('booking', {
                    url: '/booking/:id/:action/',
                    title: 'title_book',
                    css: '/css/style.css',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/thaihome/booking/index.html');
                    },
                    controller: 'BookingCtrl',
                    params: {
                        sendPaymentPending: false,
                        action: {
                            squash: true
                        }
                    },
                    resolve: {
                        BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
                            var deferred = $q.defer();
                            Booking.getDetails($stateParams.id).then(function (data) {
                                deferred.resolve(data);
                            }).catch(function (err) {
                                deferred.reject(err, 404);
                            });
                            return deferred.promise;
                        }],
                        // Email: ["Email", "$stateParams", "$rootScope", "$q", function (Email, $stateParams, $rootScope, $q) {
                        //     var deffered = $q.defer();
                        //     if ($stateParams.sendPaymentPending) {
                        //         Email.send('payment_payment_bank', {   // 2016-05-27 - Ajay - Change type email
                        //             booking: $stateParams.id,
                        //             preview: false,
                        //             subject: $rootScope.T.email_subject_payment_pending,
                        //             language: $rootScope.language
                        //         }).then(function () {
                        //             deffered.resolve();
                        //         }).catch(deffered.resolve);
                        //     } else {
                        //         deffered.resolve();
                        //     }
                        //     return deffered.promise;
                        // }],
                        Status: ["$stateParams", "$q", "Booking", function ($stateParams, $q, Booking) {

                            var deffered = $q.defer();
                            if ($stateParams.sendPaymentPending) {
                                Booking.update($stateParams.id, {
                                    status: 1,
                                    paymentType: 0
                                }).then(deffered.resolve).catch(deffered.resolve);
                            } else {
                                deffered.resolve();
                            }
                            return deffered.promise;
                        }]
                    }
                }).state('booking.noParam', {
                    url: '/booking/:id/',
                    title: 'title_book',
                    css: '/css/style.css',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/thaihome/booking/index.html');
                    },
                    controller: 'BookingCtrl',
                    params: {
                        sendPaymentPending: false,
                        action: {
                            squash: true
                        }
                    },
                    resolve: {
                        BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
                            var deferred = $q.defer();
                            Booking.getDetails($stateParams.id).then(function (data) {
                                deferred.resolve(data);
                            }).catch(function (err) {
                                deferred.reject(err, 404);
                            });
                            return deferred.promise;
                        }],
                        // Email: ["Email", "$stateParams", "$rootScope", "$q", function (Email, $stateParams, $rootScope, $q) {
                        //     var deffered = $q.defer();
                        //     if ($stateParams.sendPaymentPending) {
                        //         Email.send('payment_payment_bank', {   // 2016-05-27 - Ajay - Change type email
                        //             booking: $stateParams.id,
                        //             preview: false,
                        //             subject: $rootScope.T.email_subject_payment_pending,
                        //             language: $rootScope.language
                        //         }).then(function () {
                        //             deffered.resolve();
                        //         }).catch(deffered.resolve);
                        //     } else {
                        //         deffered.resolve();
                        //     }
                        //     return deffered.promise;
                        // }],
                        Status: ["$stateParams", "$q", "Booking", function ($stateParams, $q, Booking) {
                            var deffered = $q.defer();
                            if ($stateParams.sendPaymentPending) {
                                Booking.update($stateParams.id, {
                                    status: 1,
                                    paymentType: 0
                                }).then(deffered.resolve).catch(deffered.resolve);
                            } else {
                                deffered.resolve();
                            }
                            return deffered.promise;
                        }]
                    }
                });
        }])
        .factory("Booking", ["dpd", "$http", "User", "$q", "CONFIG", "Locale", "Property", "Modal", function (dpd, $http, User, $q, CONFIG, Locale, Property, Modal) {

            function check(property, agent, timestamps) {
                var d = $q.defer();
                console.log("check-var", Property, Locale);
                console.log("check-Book", property, agent, timestamps);
                Property.getDetails(property).then(function (data) {
                        var dates = Locale.getDates();
                        //This Moment is work make to unix
                        var checkin = moment(dates.checkin, CONFIG.DEFAULT_DATE_FORMAT).add(6, 'hours').unix();
                        var checkout = moment(dates.checkout, CONFIG.DEFAULT_DATE_FORMAT).unix();
                        //console.log("moment", moment.unix(checkout).utc().unix());
                        return dpd.booking.get({
                            property: data.data.property.id,
                            checkin: {
                                $lte: moment.unix(checkout).utc().unix()
                            },
                            checkout: {
                                $gt: moment.unix(checkin).utc().unix()
                            },
                            $limit: 1
                        });
                    }).then(function (data) {
                        console.log("steps2", data);
                        if (data.data.length) {
                            if (agent) {
                                Modal.doubleBookingAgent(data.data[0]);
                            } else {
                                Modal.doubleBooking(data.data[0]);
                            }
                            d.reject(data.data[0]);
                        } else {
                            console.log("False");
                            d.resolve(false);
                        }
                    })
                    .catch(function (err) {
                        d.reject(err, 404);
                    });

                return d.promise;

            }

            function getSources(source, all) {
                //console.log("");
                var booking_sources = [{
                    "value": 0,
                    "name": "[T] ThaiHome"
                }, {
                    "value": 1,
                    "name": "[B] Booking.com"
                }, {
                    "value": 2,
                    "name": "[A] AirBnB"
                }, {
                    "value": 4,
                    "name": "[E] Expedia"
                }];

                if (all) return booking_sources;
                //console.log("get-Sources",booking_sources);

                return _.findWhere(booking_sources, {
                    value: source
                });

            }

            function getDetails(id, lng) {
                console.log("getDetails-and id");
                var language = localStorage.getItem('locale');
                if (typeof lng != 'undefined') {
                    language = lng;
                }
                var d = $q.defer();
                if (!id) {
                    d.reject();
                } else {
                    $http.get(CONFIG.API_URL + '/booking/' + id, {
                            params: {
                                "language": language
                            }
                        })
                        .then(function (response) {
                            d.resolve(response);
                        }, function (err) {
                            d.reject(err);
                        });
                }
                return d.promise;
            }

            function findManagement() {
                console.log("Find Mange");
                var d = $q.defer();
                $http.get(CONFIG.API_URL + '/getbookings/')
                    .then(function (response) {
                        d.resolve(response);
                    }, function () {
                        d.resolve({
                            data: []
                        });
                    });
                return d.promise;
            }


            function findManagementOld(query) {
                var d = $q.defer();
                $http.get(CONFIG.API_URL + '/getbookingsold/', {
                        params: query
                    })
                    .then(function (response) {
                        console.log('getbook form api');
                        d.resolve(response);
                    }, function () {
                        d.resolve({
                            data: []
                        });
                    });
                return d.promise;
            }

            function find(query) {
                var d = $q.defer();
                dpd.booking.get(query)
                    .then(function (response) {
                        console.log("Query is:", response);
                        d.resolve(response);
                    }, function () {
                        d.resolve({
                            data: []
                        });
                    });
                return d.promise;
            }

            function update(id, data) {
                var d = $q.defer();
                $http.put(CONFIG.API_URL + '/booking/' + id, data).then(function (data) {
                    d.resolve(data.data);
                }).catch(function (e) {
                    d.reject(e);
                });
                return d.promise;
            }

            function del(id) {
                var d = $q.defer();
                $http.delete(CONFIG.API_URL + '/booking/' + id).then(function (data) {
                    d.resolve(data);
                }).catch(function (e) {
                    d.reject(e);
                });
                return d.promise;
            }

            /**
             * 2016-05-13 - Ajay - Delete Selected & All bookings
             **/
            function delAll(data) {
                var d = $q.defer();
                $http.post(CONFIG.API_URL + '/deleteall', data).then(function (data) {
                    d.resolve(data);
                }).catch(function (e) {
                    d.reject(e);
                });
                return d.promise;
            }

            function newBooking(booking) {
                console.log("mandorin :", booking);
                var bookingData = booking;
                var d = $q.defer();
                User.getOne(booking.user.email, booking.user, true).then(function (user) {
                    return user;
                }).then(function (data) {
                    bookingData.user = data.id;

                    return $http.post(CONFIG.API_URL + '/booking', bookingData);
                }).then(function (result) {
                    d.resolve(result);
                }).catch(function (err) {
                    d.reject(err);
                });
                return d.promise;
            }

            function getStatus(status, all) {
                console.log("GET-STATUS");
                var booking_statuses = [{
                        "value": 0,
                        "name": "New Booking"
                    }, {
                        "value": 1,
                        "name": "Pending"
                    },
                    {
                        "value": 2,
                        "name": "Booked"
                    }, {
                        "value": 3,
                        "name": "Check-in"
                    }, {
                        "value": 4,
                        "name": "Check-out"
                    }, {
                        "value": 5,
                        "name": "Done"
                    },
                    {
                        "value": 6,
                        "name": "Cancelled"
                    }
                ];

                if (all) return booking_statuses;
                //console.log(booking_statuses);
                return _.findWhere(booking_statuses, {
                    value: status
                });
            }
            console.log("Test function");
            //getStatus();
            //newBooking();
            return {
                getStatus: getStatus,
                getSources: getSources,
                newBooking: newBooking,
                find: find,
                check: check,
                getDetails: getDetails,
                update: update,
                delete: del,
                deleteAll: delAll,
                findManagement: findManagement,
                findManagementOld: findManagementOld
            };

        }])
        .controller('BookingCtrl', ['BookingData', 'Payment', 'Contact', 'Modal', 'gMaps', '$scope', 'CONFIG', '$compile', '$rootScope', '$state', 'Booking', 'Notification', '$stateParams', '$timeout', function (BookingData, Payment, Contact, Modal, gMaps, $scope, CONFIG, $compile, $rootScope, $state, Booking, Notification, $stateParams, $timeout) {
            $scope.showLastChat = function () {
                $timeout(function () {
                    jQuery('.smaller-chat').scrollTop(jQuery('.smaller-chat')[0].scrollHeight);
                }, 1000);
            };

            $scope.isBookingController = true;


            $scope.showPayment = false;

            $scope.showPaymentToggle = function () {
                $scope.showPayment = !$scope.showPayment;
                if ($scope.data.paymentType == 0 || $scope.data.paymentType == 1 || $scope.data.paymentType == 3) {
                    $scope.selectPayment($scope.data.paymentType);
                }
                $('body').animate({
                    scrollTop: 0
                }, '300');
                setTimeout(function () {
                    angular.element('.search-option-payment').val($scope.data.paymentType);
                }, 300);
            };

            /** Ajay - Remove local booking id after arrive in booking page */
            localStorage.removeItem('past-booking-id');

            $scope.chatdisabled = false;
            $scope.data = BookingData.data;

            // pay calc start
            $scope.getInvoiceTotal = function (invoice) {
                var total = 0;
                for (var i = 0; i < invoice.invoiceLines.length; i++) {
                    total += invoice.invoiceLines[i].amountTotal;
                }
                return total;
            };

            $scope.mustPayBooking = function () {
                var mustPay = 0;
                if ($scope.payedAlready() == 0) {
                    if ($scope.data.priceReservation != null && $scope.data.priceReservation != 0) {
                        mustPay = $scope.data.priceReservation;
                    } else {
                        mustPay = $scope.data.cleanfinalprice + ($scope.data.priceDay * $scope.data.nights - ($scope.data.priceDay * $scope.data.nights / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                    }
                    return mustPay;
                } else {
                    return mustPay;
                }
            };

            $scope.ratingUrl = window.location.origin + "/rating/" + $scope.data.id;
            $scope.calculateMissingPrice = function () {
                var mustPay = 0;
                for (var i = 0; i < $scope.data.invoice.length; i++) {
                    mustPay += $scope.getInvoiceTotal($scope.data.invoice[i]);
                }
                var payedAmount = 0;
                for (var j = 0; j < $scope.data.receipt.length; j++) {
                    payedAmount += $scope.data.receipt[j].amount;
                }

                if ($scope.data.discountPercentage != 0) {
                    $scope.payableAmount = ($scope.data.priceDay * $scope.data.nights - ($scope.data.priceDay * $scope.data.nights / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                } else if (typeof $scope.data.discountAmount != 'undefined') {
                    $scope.payableAmount = ($scope.data.priceDay * $scope.data.nights + Number($scope.data.discountAmount)) + $scope.priceExtra;
                } else {
                    $scope.payableAmount = $scope.data.priceDay * $scope.data.nights + $scope.priceExtra;
                }
                window.amount = $scope.payableAmount;
                if (payedAmount != 0) {
                    $scope.payableAmount = $scope.payableAmount - payedAmount;
                    $scope.reservationAction = false;
                } else {
                    $scope.payableAmount = $scope.payableAmount;
                    $scope.reservationAction = true;
                }
                return $scope.payableAmount;
            };
            $scope.$watch('payableAmount', function () {
                if (typeof $scope.T != 'undefined') {
                    $scope.payableReservationText = $scope.T.transReservePay.replace('#AMOUNT#', bothPrices($scope.payableAmount, $rootScope.currency, Number($rootScope.currencyRate), 'right'));
                }
            });
            $rootScope.$watch('currency', function () {
                if (typeof $scope.T != 'undefined') {
                    $scope.payableReservationText = $scope.T.transReservePay.replace('#AMOUNT#', bothPrices($scope.payableAmount, $rootScope.currency, Number($rootScope.currencyRate), 'right'));
                }
            });

            $scope.totalPrice = function () {
                if ($scope.data.discountPercentage != 0) {
                    return ($scope.data.priceDay * $scope.data.nights - ($scope.data.priceDay * $scope.data.nights / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;

                } else if (typeof $scope.data.discountAmount != 'undefined') {
                    return ($scope.data.priceDay * $scope.data.nights + Number($scope.data.discountAmount)) + $scope.priceExtra;

                } else {
                    return $scope.data.priceDay * $scope.data.nights + $scope.priceExtra;
                }
            }


            $scope.payDayLessThenFourDays = function () {
                if ((Math.round(new Date($scope.data.checkin) / 1000)) < Math.round(new Date() / 1000) + 345600) {
                    return true;
                } else {
                    return false;
                }
            };
            $scope.calcPayMethod = function () {
                var payMethod = '';
                if (typeof $scope.T != 'undefined') {
                    if ((Math.round(new Date($scope.data.checkin) / 1000)) < Math.round(new Date() / 1000) + 604800) {
                        payMethod = '<b>' + $scope.T.transMethodCard + '</b> ' + $scope.T.transOr + ' <b>' + $scope.T.transMethodPal + '</b>'
                    } else {
                        payMethod = '<b>' + $scope.T.transMethodCard + '</b> ' + $scope.T.transOr + ' <b>' + $scope.T.transMethodBank + '</b> ' + $scope.T.transOr + ' <b>' + $scope.T.transMethodPal + '</b>';
                    }
                    return payMethod;
                }
            };
            $scope.payedAlready = function () {
                var payedAmount = 0;
                for (var j = 0; j < $scope.data.receipt.length; j++) {
                    payedAmount += $scope.data.receipt[j].amount;
                }
                return payedAmount;
            };

            //  The payment props calc
            $scope.isBooking = true;
            $scope.data.checkin = moment.unix(BookingData.data.checkin).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
            $scope.data.checkout = moment.unix(BookingData.data.checkout).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
            $scope.data.expires = moment.unix(BookingData.data.expires).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
            $scope.saveDates = function () {
                Booking.update($scope.data.id, {
                    arrival: $scope.data.arrival,
                    departure: $scope.data.departure
                }).then(function () {
                    $scope.contact.message = "I set my Arrival Time to: " + $scope.data.arrival + "\n\nI set my Departure Time to: " + $scope.data.departure;
                    Contact.askQuestion($scope.contact, false, false, $scope.data.id).then(function (messages) {
                        $scope.messages = messages;
                        $scope.contact.message = '';
                        $scope.chatdisabled = false;
                        Notification.success({
                            message: 'Arrival/Departure dates updated!'
                        });
                    });
                });
            };
            $scope.changeDates = function () {
                jQuery('form[name=contact-form] textarea').val('Hi, I would like to change my booking dates to:').focus();
                jQuery('html, body').animate({
                    scrollTop: jQuery("chat").offset().top - 66
                }, 2000);
            };

            $scope.steps = [{
                templateUrl: 'templates/payment/steps/final.html',
                hasForm: true,
                title: 'Update validity'
            }, ];

            $scope.voucherLink = $state.href('voucher', {
                id: $scope.data.id
            }, {
                absolute: true
            });

            if (!$rootScope.agent) {
                if (BookingData.data.user != undefined) {
                    $scope.contact = {
                        name: BookingData.data.user.name,
                        email: BookingData.data.user.email
                    };
                } else {
                    $scope.contact = {};
                }
            } else {
                $scope.contact = {
                    name: $rootScope.agent.name,
                    email: $rootScope.agent.email
                };
            }

            $scope.priceExtra = 0;
            _.map($scope.data.priceExtra, function (price) {
                $scope.priceExtra += parseInt(price.price);
            });

            $scope.paymentMethods = Payment.storefrontPayments();
            $scope.selectPayment = function (id) {
                var paymentDirectiveData = _.findWhere($scope.paymentMethods, {
                    id: parseInt(id)
                });
                var paymentDirectiveName = paymentDirectiveData.directive;

                var AMOUNT = $scope.data.cleanfinalprice + ($scope.data.priceDay * $scope.data.nights - ($scope.data.priceDay * $scope.data.nights / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                $timeout(function () {
                    var paymentDirective = $compile('<payment-' + paymentDirectiveName + ' rate="' + $scope.data.rate + '" language="' + $rootScope.language + '" currency="' + $scope.data.currency.currency + '" amount="' + AMOUNT + '" bookingid="' + $scope.data.id + '"></payment-' + paymentDirectiveName + '>')($scope);
                    $('#payment_placeholder').html(paymentDirective);
                }, 1000);


            };

            $scope.translation = BookingData.data.translation;
            $scope.property = BookingData.data.property;

            if (BookingData.data.messages != undefined) {
                BookingData.data.messages.messages = _.sortBy(BookingData.data.messages.messages, 'date'); // 2016-05-17 - Ajay - Sort Messages at booking page
                $scope.messages = BookingData.data.messages;
                $timeout(function () {
                    $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
                }, 500);
            } else {
                $scope.messages = [];
            }


            $scope.$on('mapInitialized', function (event, map) {
                var data = {
                    address2: $scope.property.address2,
                    address3: $scope.property.address3,
                    name: $scope.property.name,
                    featured: $scope.property.featured,
                    unique: $scope.property.unique,
                    gmapsdata: $scope.property.gmapsdata
                };
                gMaps.propertyMap(map, data);

                $scope.openGallery = function () {
                    Modal.openGallery($scope.property.images, $scope.property.unique);
                };

                $scope.rules = function () {
                    Modal.rules($scope.translation);
                };

                $scope.cancellation = function () {
                    Modal.cancellation();
                };

                $scope.askQuestion = function () {
                    $scope.chatdisabled = true;
                    Contact.askQuestion($scope.contact, false, false, $scope.data.id).then(function (messages) {
                        $scope.messages = messages;
                        Modal.messageReceived();
                        $scope.contact.message = '';
                        $scope.chatdisabled = false;
                    });
                };
                $scope.paymentError = false;
                if ($stateParams.action == 'card_error') {
                    $scope.paymentError = true;
                    $scope.showPaymentToggle();
                    $scope.$apply();
                }

                if ($stateParams.action == 'PAY') {
                    $scope.showPaymentToggle();
                    $scope.$apply();
                }

                if ($stateParams.action === 'contact') {
                    $('html,body').animate({
                        scrollTop: $("chat").offset().top - 65
                    });
                    $("#txtChat").focus();
                } else if ($stateParams.action === 'watch') {
                    $scope.openGallery();
                } else if ($stateParams.action === 'rules') {
                    $scope.rules();
                } else if ($stateParams.action === 'cancel') {
                    $scope.cancellation();
                } else if ($stateParams.action == 'time') {
                    angular.element('body').stop().animate({
                        scrollTop: angular.element('#arrivalTimeInput').offset().top - 150
                    }, '500', 'swing');
                    setTimeout(function () {
                        angular.element('#arrivalTimeInput').focus();
                    }, 400);
                }
            });
        }])
        .controller('BookCtrl', ['CountriesList', 'Booking', 'Locale', 'Discount', 'Modal', 'currentUser', 'Message', '$http', '$scope', 'PropertyData', 'Rating', 'Contact', '$rootScope', 'CONFIG', 'gMaps', '$stateParams', 'Dates', 'Email', 'Agent', 'Payment', '$compile', 'Location', '$timeout', '$sce', function (CountriesList, Booking, Locale, Discount, Modal, currentUser, Message, $http, $scope, PropertyData, Rating, Contact, $rootScope, CONFIG, gMaps, $stateParams, Dates, Email, Agent, Payment, $compile, Location, $timeout, $sce) {
            $scope.helperUrl = CONFIG.HELPER_URL;
            $scope.reservationAction = false;
            $scope.paypalBookBtn = function () {
                Booking.update($scope.bookingID, {
                    status: 1,
                    paymentType: 3
                }).then(function () {
                    window.location.pathname = "/booking/" + $scope.bookingID;
                });
            };

            $http.get(CONFIG.HELPER_URL + '/users/getAdminsAndManagersAndTranslators', {}).then(function (res) {
                console.log("DATA FROM ADMINS", res);
                $scope.userList = res.data.data;
            });

            $scope.compareUserInfo = function (email) {
                if (typeof $scope.userList != 'undefined') {
                    var user = $scope.userList.filter(function (obj) {
                        return obj.email == email;
                    });
                    if (user.length) {
                        console.log('user type : ', user[0].type);
                        if (user[0].type == "admin" || user[0].type == "translator") {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            };

            $scope.paymentMethods = Payment.storefrontPayments();
            $scope.selectPayment = function (id) {
                $scope.paymentType = parseInt(id);
                var paymentDirectiveData = _.findWhere($scope.paymentMethods, {
                    id: parseInt(id)
                });
                var paymentDirectiveName = paymentDirectiveData.directive;
                var AMOUNT = $scope.payableAmount;
                $timeout(function () {
                    var paymentDirective = $compile('<payment-' + paymentDirectiveName + '></payment-' + paymentDirectiveName + '>')($scope);
                    $('#payment_placeholder').html(paymentDirective);
                }, 1000);
            };
            //console.log(PropertyData.price);
            $scope.property = PropertyData.property;
            $scope.translation = PropertyData.property.translation;
            $scope.price = 0;
            $scope.price = PropertyData.price;
            $scope.nights = PropertyData.price.nights;
            $scope.reservationAction = false;

            $scope.getReservationPrice = function () {
                // console.log('set-andconfig-price');
                if ($scope.price == 0 && typeof $scope.discount != 'undefined') {
                    $scope.getReservationPrice();
                } else {
                    console.log($scope.price.priceTotal)
                    $scope.payableAmount = 0;
                    $scope.priceDay = $scope.price.priceNight;
                    $scope.property.cleanfinalprice = 750;
                    $scope.property.cleanprice = 750;
                    window.amount = 0;
                    if ($scope.price.priceNight != 0 && typeof $scope.price.priceNight != 'undefined' &&
                        $scope.price.reservationWeek != 0 && typeof $scope.price.reservationWeek != 'undefined' &&
                        $scope.price.reservationMonth != 0 && typeof $scope.price.reservationMonth != 'undefined' &&
                        $scope.price.reservationYear != 0 && typeof $scope.price.reservationYear != 'undefined') {
                        console.log("GOT TO RESERVATION");
                        if ($scope.nights < 7) {
                            $scope.payableAmount = $scope.price.reservationDay;
                            window.amount = $scope.price.reservationDay;
                        } else if ($scope.nights < 30) {
                            $scope.payableAmount = $scope.price.reservationWeek;
                            window.amount = $scope.price.reservationWeek;
                        } else if ($scope.nights < 365) {
                            $scope.payableAmount = $scope.price.reservationMonth;
                            window.amount = $scope.price.reservationMonth;
                        } else {
                            $scope.payableAmount = $scope.price.reservationYear;
                            window.amount = $scope.price.reservationYear;
                        }
                        $scope.reservationAction = true;
                    } else {
                        console.log("GOT TO TOTAL");
                        if ($scope.data.discountPercentage != 0) {
                            $scope.payableAmount = ($scope.price.priceTotal - ($scope.price.priceTotal / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                            window.amount = ($scope.price.priceTotal - ($scope.price.priceTotal / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                        } else if (typeof $scope.data.discountAmount != 'undefined') {
                            $scope.payableAmount = ($scope.price.priceTotal + Number($scope.data.discountAmount)) + $scope.priceExtra;
                            window.amount = ($scope.price.priceTotal + Number($scope.data.discountAmount)) + $scope.priceExtra;
                        } else {
                            $scope.payableAmount = $scope.data.priceTotal;
                            window.amount = $scope.data.priceTotal + $scope.priceExtra;
                        }
                    }
                }
            };

            $scope.$watch('payableAmount', function () {
                if (typeof $scope.T != 'undefined') {
                    $scope.payableReservationText = $scope.T.transReservePay.replace('#AMOUNT#', bothPrices($scope.payableAmount, $rootScope.currency, Number($rootScope.currencyRate), 'right'));
                }
            });
            $rootScope.$watch('currency', function () {
                if (typeof $scope.T != 'undefined') {
                    $scope.payableReservationText = $scope.T.transReservePay.replace('#AMOUNT#', bothPrices($scope.payableAmount, $rootScope.currency, Number($rootScope.currencyRate), 'right'));
                }
            });

            $scope.payableReservationText = $scope.T.transReservePay.replace('#AMOUNT#', $scope.payableAmount);

            $scope.priceDay = PropertyData.price.price;
            $scope.countries = CountriesList;
            $scope.refAgent = Agent;
            if ($stateParams.discount) {
                Discount.getDiscount($stateParams.discount, currentUser.data.id, $scope.property.id).then(function (discount) {
                    if (discount.length) {
                        $scope.discount = discount[0];
                    } else {
                        $scope.discount = {
                            "percent": 0
                        };
                    }
                    $scope.getReservationPrice();
                });
            } else {
                $scope.discount = {
                    "percent": 0
                };
                $scope.getReservationPrice();
            }


            if (!_.isEmpty(currentUser.data)) {
                $scope.contact = {};
                $scope.contact.name = currentUser.data.name;
                $scope.contact.email = currentUser.data.email;
                $scope.contact.message = '';
                $scope.contact.country = currentUser.data.country;
                $scope.contact.phone = currentUser.data.phone;
            } else {
                $scope.contact = {};
            }
            var pastBookingCountry = localStorage.getItem('past-booking-country');
            if (pastBookingCountry !== null) {
                $scope.contact.country = pastBookingCountry;
            } else {
                $scope.contact.country = Location && Location.data && Location.data.country || null;
            }

            if (!_.isEmpty(Message.data)) {
                $scope.messages = Message.data[0];
            } else {
                $scope.messages = {};
            }


            $scope.askQuestion = function () {
                if ($scope.messages.id) {
                    var subMessage = {
                        "date": moment().unix(),
                        "manager": false,
                        "message": $scope.contact.message,
                        "property": $stateParams.id
                    };
                    $scope.messages.read = false;
                    $scope.messages.messages.push(subMessage);
                } else {
                    var newMessage = {
                        read: false,
                        messages: [{
                            "manager": false,
                            "date": moment().unix(),
                            "message": $scope.contact.message,
                            "property": $stateParams.id
                        }]
                    };

                    $scope.messages = newMessage;
                }

                Contact.askQuestion($scope.contact.name, $scope.contact.email, $scope.messages);
                Modal.messageReceived();
                $scope.contact.message = '';
            };

            $scope.getDay = function (timestamp) {
                //console.log("get-days-timestamp");
                return Contact.getDay(timestamp);
            };

            $scope.openGallery = function () {
                Modal.openGallery($scope.property.images, $scope.property.unique);
            };

            $scope.propertyDetails = function () {
                Modal.propertyDetails($scope.property, $scope.translation);
            };

            $scope.rules = function () {
                Modal.rules($scope.translation);
            };

            $scope.cancellation = function () {
                Modal.cancellation();
            };
            $scope.checkin = Dates.checkin;
            $scope.checkout = Dates.checkout;


            $scope.steps = [{
                    templateUrl: 'templates/payment/steps/first.html',
                    title: 'Introduction',
                    hasForm: true
                },
                {
                    templateUrl: 'templates/payment/steps/final.html',
                    hasForm: true,
                    title: 'Update validity'
                }
            ];


            $scope.book = function () {

                console.log("PROPERTY : ", $scope.property);
                var reservation = 0;
                var deposit = 0;

                if ($scope.nights < 7) {
                    reservation = $scope.price.reservationDay;
                    deposit = $scope.price.depositDay;
                } else if ($scope.nights < 30) {
                    reservation = $scope.price.reservationWeek;
                    deposit = $scope.price.depositWeek;
                } else if ($scope.nights < 365) {
                    reservation = $scope.price.reservationMonth;
                    deposit = $scope.price.depositMonth;
                } else {
                    reservation = $scope.price.reservationYear;
                    deposit = $scope.price.depositYear;
                }

                var checkinTime = moment($scope.checkin).utc();
                var nowInMoment = moment().utc();

                var expTime = '';

                if (checkinTime.diff(nowInMoment, 'days') == 0) {
                    expTime = moment().utc().unix();
                } else if (checkinTime.diff(nowInMoment, 'days') <= 6) {
                    expTime = moment().utc().add(1, 'day').unix();
                } else if (checkinTime.diff(nowInMoment, 'days') > 6 && checkinTime.diff(nowInMoment, 'days') < 30) {
                    expTime = moment().utc().add(5, 'day').unix();
                } else if (checkinTime.diff(nowInMoment, 'days') >= 30) {
                    expTime = moment().utc().add(10, 'day').unix();
                }

                console.log(" exp date : ", expTime, " : DIFF : ", checkinTime.diff(nowInMoment, 'days'));

                $scope.discountPrice = 0;

                if (typeof $scope.discount.percent != 'undefined') {
                    $scope.discountPrice = Math.round($scope.nights * $scope.priceDay / 100 * ($scope.discount.percent || 1));
                }

                if (typeof deposit == 'undefined') {
                    deposit = 0;
                }
                console.log("Booking data", $scope.property.property.unique);
                var booking = {
                    "property": $scope.property.property.unique,
                    "user": {
                        "email": $scope.contact.email,
                        "name": $scope.contact.name,
                        "country": $scope.contact.country,
                        "phone": $scope.contact.phone,
                        "agent": $scope.refAgent ? $scope.refAgent.id : ''
                    },
                    "agent": $scope.refAgent ? $scope.refAgent.id : '',
                    "agentCommission": $scope.agent_commission,
                    "discount": $scope.discount.id,
                    "discountPercentage": $scope.discount.percent,
                    "discountAmount": $scope.discountPrice,
                    "checkin": moment.utc($scope.checkin, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
                    "checkout": moment.utc($scope.checkout, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
                    "status": 0,
                    "currency": _.findWhere($rootScope.currencies, {
                        "currency": localStorage.getItem('currency')
                    }).id,
                    "priceDay": $scope.priceDay,
                    "created": moment().utc().unix(),
                    "paymentType": 1,
                    "priceExtra": [{
                        "name": "Final cleaning",
                        "calc": "1 x " + $scope.property.cleanfinalprice,
                        "price": $scope.property.cleanfinalprice
                    }],
                    "utilitiesElectricity": $scope.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us",
                    "utilitiesWater": $scope.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us",
                    "utilitiesWifi": "Included",
                    "utilitiesCable": "Included BTV",
                    "rate": 1,
                    "cleanfinalprice": $scope.property.cleanfinalprice,
                    "cleanprice": $scope.property.cleanprice,
                    "expires": expTime,
                    "nights": $scope.nights,
                    "pricePaid": 0,
                    "emails": [],
                    "priceReservation": reservation,
                    "priceSecurity": deposit,
                    "source": 'T'
                };

                console.log("BOOKING DATA : ", $scope.contact);

                Booking.newBooking(booking).then(function (result) {
                    console.log("Booking new go go go!", result);
                    //set booking selected country to ls
                    localStorage.setItem('past-booking-country', $scope.contact.country);
                    localStorage.setItem('past-booking-id', result.data.id);
                    /** Save Booking id when refresh page */
                    Locale.deleteDates();
                    var emailParams = {
                        booking: result.data.id,
                        subject: 'Your booking at ' + $scope.property.name,
                        language: $rootScope.language
                    };

                    $http.post(CONFIG.HELPER_URL + '/booking/setBooking/', {


                        checkin: moment($scope.checkin).format('YYYY-MM-DD'),
                        checkout: moment($scope.checkout).format('YYYY-MM-DD'),
                        user: $scope.contact.name,
                        userEmail: $scope.contact.email,
                        userPhone: $scope.contact.phone,
                        userCountry: $scope.contact.country,
                        totalPrice: $scope.price.priceTotal,
                        deposit: deposit,
                        th_id: result.id,
                        prop: $scope.property.property.unique,
                        status: 0
                    }).success(function (data) {
                        console.log("DATA FROM BEDS24 about this booking :", data);
                        console.log("IF Book");
                    }, error(function (err) {
                        console.log( $scope.property.unique);
                        console.log("booking-post", err);
                    }));
                    //Email.send('booking_confirmation', emailParams); Sending booking email to tenant. not used for now
                    $scope.bookingID = result.data.id;
                    //Modal.newBooking($scope.contact.email, result.data.id);
                });
            };
        }]);
})();