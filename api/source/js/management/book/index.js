(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('management.book', {
                    url: 'book/',
                    controller: 'ManagerBookCtrl',
                    title: 'title_management_book',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/management/book/index.html');
                    },
                    params: {
                        property: false,
                        start: false,
                        end: false
                    },
                    css: ['/css/admin.css'],
                    resolve: {
                        Dates: ["Locale", function (Locale) {
                            var dates = Locale.getDates();
                            if (dates.valid) {
                                return {
                                    start: dates.checkin,
                                    end: dates.checkout
                                };
                            }
                            return {};
                        }],
                        PropertyData: ['$stateParams', 'Property', '$q', function ($stateParams, Property, $q) {
                            if ($stateParams.property) {
                                var d = $q.defer();
                                Property.getDetails($stateParams.property).then(function (data) {
                                    d.resolve(data.data);
                                }).catch(function () {
                                    d.reject();
                                });

                                return d.promise;
                            } else {
                                return false;
                            }
                        }]
                    }
                });
        }])
        .controller('ManagerBookCtrl', ['$scope', '$state', '$rootScope', 'Modal', 'Calendar', '$timeout', '$http', 'CONFIG', 'Notification', 'Property', 'Locale', 'Booking', 'PropertyData', '$stateParams', 'Dates', 'Payment', 'Countries', 'User', 'CountryToLanguage', 'Currency',
            function ($scope, $state, $rootScope, Modal, Calendar, $timeout, $http, CONFIG, Notification, Property, Locale, Booking, PropertyData, $stateParams, Dates, Payment, Countries, User, CountryToLanguage, Currency) {
                Calendar.loadCalendar(false, false, false, null);
                if ($stateParams.end) {
                    console.log($stateParams);
                    $scope.getPricesInCalendarCaase = function() {
                        $timeout(function () {
                            if (typeof $scope.data != 'undefined' && typeof $scope.pricesForRent != 'undefined') {
                                var data = $scope.pricesForRent;
                                $scope.data.priceDay = data.price;
                                $scope.data.nights = data.nights;
                                $scope.data.utilitiesElectricity = $scope.data.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us";
                                $scope.data.utilitiesWater = $scope.data.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us";
                                if ($scope.data.nights < 7) {
                                    $scope.data.priceSecurity = data.priceProps.depositDay;
                                    $scope.data.priceReservation = data.priceProps.reservationDay;
                                    $scope.agentPercent = $scope.fullPrice.commissionDay;
                                    $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                } else if ($scope.data.nights < 30) {
                                    $scope.data.priceSecurity = data.priceProps.depositWeek;
                                    $scope.data.priceReservation = data.priceProps.reservationWeek;
                                    $scope.agentPercent = $scope.fullPrice.commissionWeek;
                                    $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                } else if ($scope.data.nights < 365) {
                                    $scope.data.priceSecurity = data.priceProps.depositMonth;
                                    $scope.data.priceReservation = data.priceProps.reservationMonth;
                                    $scope.agentPercent = $scope.fullPrice.commissionMonth;
                                    $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                } else {
                                    $scope.data.priceSecurity = data.priceProps.depositYear;
                                    $scope.data.priceReservation = data.priceProps.reservationYear;
                                    $scope.agentPercent = $scope.fullPrice.commissionYear;
                                    $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                }
                                $scope.data.priceExtra.push({
                                    name: "Final cleaning",
                                    calc: "1 x " + $scope.data.property.cleanfinalprice,
                                    price: $scope.data.property.cleanfinalprice
                                });
                            }else{
                                $scope.getPricesInCalendarCaase();
                            }
                        }, 2000);
                    }
                    $scope.getPricesInCalendarCaase();
                }
                $scope.paymentMethods = Payment.methods();
                $scope.sources = Booking.getSources(null, true);
                $scope.countries = CountryToLanguage.getCountries();
                $scope.booking = {};
                $scope.bookingCurrency = '588a25ac3dd9c18b67717a5f';
                $scope.data = {
                    status: '0',
                    priceExtra: [],
                    discount: {
                        percent: 0
                    },
                    priceDay: 0,
                    nights: 0,
                    property: {
                        cleanfinalprice: 0
                    },
                    priceReservation: 0,
                    utilitiesWifi: "Included",
                    utilitiesCable: "Included BTV",
                    agent: {}
                };
                $scope.options = {
                    showDiscount: false,
                    addAgent: true,
                    addTenant: true,
                    calendarOpened: false,
                    showConditions: false,
                    showExpenses: false,
                    bookingSaved: false
                };

                $scope.data.paymentType = 5;


                $scope.data.priceReservation = "";
                $scope.longTheremPayDay = {
                    value: 1
                };
                $scope.longTheremPayPrice = {
                    value: ""
                };

                $scope.getValueForBookingScource = function (string) {
                    return string.charAt(1);
                };

                //$scope.data.conditionsTenant = "Electric and Water, you have to pay for what you use. Wifi and Cable TV included and paid by us. ";

                $scope.discountPrice = '';

                $scope.calcExtra = function () {
                    var total = 0;
                    _.each($scope.data.priceExtra, function (item) {
                        if (!isNaN(parseInt(item.price))) {
                            total = total + parseInt(item.price);
                        }
                    });
                    $scope.priceExtraCalc = total;
                };

                $scope.getExtrasPrices = function () {
                    $scope.calcExtra();
                    return ($scope.data.priceDay * $scope.data.nights + Number($scope.discountPrice)) + $scope.priceExtraCalc;
                };

                $scope.$watch('discountPrice', function () {
                    if ($scope.discountPrice > 0) {
                        $scope.discountPrice *= -1;
                    }
                });


                $scope.onDayPriceChange = function () {
                    $scope.data.priceDay = $("#datePriceField").val();
                    $scope.valueForRentPrice();
                    $scope.$apply();
                }

                User.getAll().then(function (data) {
                    $scope.userList = data;
                });

                $scope.compareUserInfo = function (email) {
                    if (typeof $scope.userList != 'undefined') {
                        var user = $scope.userList.filter(function (obj) {
                            return obj.email == email;
                        });

                        if (user.length) {
                            if (user[0].type == "admin" || user[0].type == "agent") {
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
                $scope.editUser = function () {
                    $scope.currentUserEditable = angular.copy($scope.data.tenant);
                }

                $scope.cancelUserEdit = function () {
                    $scope.data.tenant = $scope.currentUserEditable;
                    angular.element('#formTenant')[0].style.display = 'none';
                    angular.element('#showTenant')[0].style.display = 'inline';
                }

                $scope.saveUser = function () {
                    var currentUser = $scope.userList.filter(function (obj) {
                        return obj.email == $scope.data.tenant.email;
                    });
                    if (currentUser.length) {
                        User.update(currentUser[0].id, $scope.data.tenant);
                        if ($scope.data.tenant.country != '' && typeof $scope.data.tenant.country != 'undefined') {
                            var currentC = CountryToLanguage.getCurrencyByCountryName($scope.data.tenant.country);
                            Currency.getAll().then(function (data) {
                                console.log("CURRENT C : :", currentC)
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i].currency == currentC && data[i].active == true) {
                                        $scope.bookingCurrency = data[i].id;
                                    }
                                }
                                console.log($scope.bookingCurrency);
                            });
                        }
                    } else {
                        $scope.data.tenant.id = "";
                        $scope.data.tenant.username = $scope.data.tenant.name;
                        $scope.data.tenant.password = $scope.data.tenant.email;
                        $scope.data.tenant.type = 'tenant';
                        User.add($scope.data.tenant).then(function (data) {
                            var country = data.data.country;
                            if (country != '' && typeof country != 'undefined') {
                                var currentC = CountryToLanguage.getCurrencyByCountryName(country);
                                Currency.getAll().then(function (data) {
                                    console.log("CURRENT C : :", currentC)
                                    for (var i = 0; i < data.length; i++) {
                                        if (data[i].currency == currentC && data[i].active == true) {
                                            $scope.bookingCurrency = data[i].id;
                                        }
                                    }
                                    console.log($scope.bookingCurrency);
                                });
                            }

                        });
                    }
                }

                $scope.getDayPrice = function () {
                    $scope.valueForRentPrice();
                    $("#totalPriceInput").val($scope.valueForRentPrice())
                    return $scope.data.priceDay;
                }

                $scope.onRentPriceChange = function () {
                    if ($scope.data.discountAmount == '' || !$scope.data.discountAmount || typeof $scope.data.discountAmount == 'undefined') {
                        $scope.discountPrice = Math.round($scope.data.nights * $scope.data.priceDay / 100 * ($scope.data.discount.percent || 1));
                    }
                    $scope.data.priceDay = Number($("#totalPriceInput").val()) / $scope.data.nights;
                    $scope.valueForRentPrice();
                    $('#datePriceField').val($scope.data.priceDay);
                    $scope.$apply();
                }

                $scope.valueForRentPrice = function () {
                    if (typeof $scope.discountPrice != 'undefined') {
                        $scope.recentPriceValue = Number(($scope.data.nights * $scope.data.priceDay));
                        return Number(($scope.data.nights * $scope.data.priceDay));
                    } else {
                        $scope.recentPriceValue = Number(($scope.data.nights * $scope.data.priceDay));
                        return Number(($scope.data.nights * $scope.data.priceDay));
                    }
                }

                $scope.recentPriceValue = $scope.valueForRentPrice();


                if (PropertyData) {
                    $scope.data.property = PropertyData.property;
                    $scope.fullPrice = PropertyData.price;
                }

                $scope.addExtra = function () {
                    $scope.data.priceExtra.push({
                        name: "",
                        calc: "",
                        price: 0
                    });
                };

                $scope.removeDiscount = function () {
                    $scope.options.showDiscount = false;
                    $scope.data.discount = {
                        percent: 0
                    };
                };

                $scope.removeExtra = function (i) {
                    $scope.data.priceExtra.splice(i, 1);
                    $scope.calcExtra();
                };
                $scope.calcExtra = function () {
                    var total = 0;
                    _.each($scope.data.priceExtra, function (item) {
                        total = total + parseInt(item.price);
                    });
                    $scope.priceExtraCalc = total;

                };

                $scope.propertyList = function () {
                    Modal.propertyList($scope.data.checkin, $scope.data.checkout);
                };

                $scope.currencyList = function () {
                    Modal.currencyList();
                };

                $scope.agentList = function () {
                    Modal.agentList(true, $scope.data.agentCommission);
                };

                $scope.tenantList = function () {
                    Modal.tenantList();
                };

                $scope.discountList = function () {
                    Modal.discountList();
                };

                $scope.emailList = function () {
                    Modal.emailList($scope.bookingID);
                };

                $scope.openCalendar = function () {

                    $scope.options.calendarOpened = true;
                    $timeout(function () {
                        try {
                            $('.arrival').data('dateRangePicker').open();
                        } catch (e) {
                            Calendar.destroy();
                            Calendar.loadCalendar($scope.data.checkin || false, $scope.data.checkout || false, false, $scope.bookings || null);
                            $timeout(function () {
                                $('.arrival').data('dateRangePicker').open();
                            }, 100);
                        }
                    });

                };

                $rootScope.$on("propertySelected", function (event, property) {

                    Calendar.destroy();
                    Property.getDetails(property.unique).then(function (data) {
                        if (typeof data.data.property.cleanfinalprice != 'undefined' && data.data.property.cleanfinalprice != 0) {//$$%%
                            $scope.data.priceExtra = $scope.data.priceExtra.filter(function (obj) {
                                return obj.name != "Final cleaning";
                            });
                            $scope.data.priceExtra.push({
                                name: "Final cleaning",
                                calc: "1 x " + data.data.property.cleanfinalprice,
                                price: data.data.property.cleanfinalprice
                            });
                        }
                        $scope.bookings = data.data.bookings;
                        $scope.fullPrice = data.data.price;
                        if ($scope.data.checkin && $scope.data.checkout) {
                            Calendar.loadCalendar($scope.data.checkin, $scope.data.checkout, false, $scope.bookings);
                        } else {
                            Calendar.loadCalendar(false, false, false, $scope.bookings);
                        }
                        $timeout(function () {
                            $scope.data.property = property;
                            if ($scope.data.checkin && $scope.data.checkout) {
                                $http.get(CONFIG.API_URL + '/getprice', {
                                    params: {
                                        "property": $scope.data.property.id,
                                        "checkin": $scope.data.checkin,
                                        "checkout": $scope.data.checkout,
                                        "format": CONFIG.DEFAULT_DATE_FORMAT
                                    }
                                }).success(function (data) {
                                    $scope.pricesForRent = data;
                                    $scope.data.priceDay = data.price;
                                    $scope.data.nights = data.nights;
                                    $scope.data.utilitiesElectricity = $scope.data.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us";
                                    $scope.data.utilitiesWater = $scope.data.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us";
                                    if ($scope.data.nights < 7) {
                                        $scope.data.priceSecurity = data.priceProps.depositDay;
                                        $scope.data.priceReservation = data.priceProps.reservationDay;
                                        $scope.agentPercent = $scope.fullPrice.commissionDay;
                                        $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                    } else if ($scope.data.nights < 30) {
                                        $scope.data.priceSecurity = data.priceProps.depositWeek;
                                        $scope.data.priceReservation = data.priceProps.reservationWeek;
                                        $scope.agentPercent = $scope.fullPrice.commissionWeek;
                                        $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                    } else if ($scope.data.nights < 365) {
                                        $scope.data.priceSecurity = data.priceProps.depositMonth;
                                        $scope.data.priceReservation = data.priceProps.reservationMonth;
                                        $scope.agentPercent = $scope.fullPrice.commissionMonth;
                                        $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                    } else {
                                        $scope.data.priceSecurity = data.priceProps.depositYear;
                                        $scope.data.priceReservation = data.priceProps.reservationYear;
                                        $scope.agentPercent = $scope.fullPrice.commissionYear;
                                        $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                    }

                                });
                            }
                        });

                    });
                });

                $rootScope.$on("agentSelected", function (event, agent, commission, conditionsAgent) {
                    $scope.data.agentCommission = commission;
                    $scope.data.conditionsAgent = conditionsAgent;
                    $scope.data.agent = agent;
                });

                $rootScope.$on("tenantSelected", function (event, tenant) {
                    $scope.data.tenant = tenant;
                });

                $rootScope.$on("discountSelected", function (event, discount) {
                    $scope.data.discount = discount;
                    $scope.options.showDiscount = true;
                    $scope.discountPrice = Math.round(Number($scope.data.nights * $scope.data.priceDay / 100 * ($scope.data.discount.percent || 1)));
                });

                $scope.$watch("discountPrice", function () {
                });

                $rootScope.$on("datesChanged", function (event, dates) {
                    $scope.applyDates(dates);
                });

                $scope.applyDates = function (dates) {
                    if ($scope.options.calendarOpened) {
                        $timeout(function () {
                            $scope.data.checkin = dates.checkin;
                            $scope.data.checkout = dates.checkout;
                            if ($scope.data.property.id) {
                                $http.get(CONFIG.API_URL + '/getprice', {
                                    params: {
                                        "property": $scope.data.property.id,
                                        "checkin": dates.checkin,
                                        "checkout": dates.checkout,
                                        "format": CONFIG.DEFAULT_DATE_FORMAT
                                    }
                                }).success(function (data) {
                                    $scope.pricesForRent = data;
                                    $scope.data.priceDay = data.price;
                                    $scope.data.nights = data.nights;
                                    $scope.data.utilitiesElectricity = $scope.data.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us";
                                    $scope.data.utilitiesWater = $scope.data.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us";
                                    if ($scope.data.nights < 7) {
                                        $scope.agentPercent = $scope.fullPrice.commissionDay;
                                        $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                    } else if ($scope.data.nights < 30) {
                                        $scope.agentPercent = $scope.fullPrice.commissionWeek;
                                        $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                    } else if ($scope.data.nights < 365) {
                                        $scope.agentPercent = $scope.fullPrice.commissionMonth;
                                        $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                    } else {
                                        $scope.agentPercent = $scope.fullPrice.commissionYear;
                                        $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                    }

                                });
                            }
                        });
                    }
                };

                if ($stateParams.property && $stateParams.start && $stateParams.end) {
                    $scope.options.calendarOpened = true;
                    $scope.data.checkin = $stateParams.start;
                    $scope.data.checkout = $stateParams.end;
                    $scope.applyDates({
                        checkin: $stateParams.start,
                        checkout: $stateParams.end
                    });
                }

                $scope.book = function () {
                    var nextpaymentDate = 0;
                    if ($scope.data.rentpayday > 0 && $scope.data.rentpayday <= 31) {
                        if (parseInt(moment().utc().format('D')) <= parseInt($scope.data.rentpayday)) {
                            nextpaymentDate = moment.utc(moment.utc().format('YYYY') + '-' + moment.utc().format('MM'), 'YYYY-MM').format('YYYY-MM');
                            nextpaymentDate = nextpaymentDate + '-' + $scope.data.rentpayday;
                            nextpaymentDate = moment.utc(nextpaymentDate, 'YYYY-MM-D').unix();
                        } else {
                            nextpaymentDate = moment.utc(moment().utc().format('YYYY') + '-' + moment.utc().add(1, 'month').format('MM'), 'YYYY-MM').format('YYYY-MM');
                            nextpaymentDate = nextpaymentDate + '-' + $scope.data.rentpayday;
                            nextpaymentDate = moment.utc(nextpaymentDate, 'YYYY-MM-D').unix();
                        }
                    }

                    $scope.getFilledExtra = function () {
                        return $scope.data.priceExtra.filter(function (obj) {
                            return obj.calc !== "" && obj.name != "" && obj.price != ""
                        })
                    }

                    $scope.returnAgentId = function () {
                        if (typeof $scope.data.agent != 'undefined') {
                            return $scope.data.agent.id;
                        } else {
                            return "";
                        }
                    }
                    if ($scope.data.priceSecurity == null) {
                        $scope.data.priceSecurity = 0;
                    }

                    if ($scope.data.priceReservation == null) {
                        $scope.data.priceReservation = 0;
                    }
                    $scope.getDayDiff = function (date) {
                        var date = Math.round(new Date(date) / 1000);
                        var diff = Math.round((date - Math.round(new Date() / 1000)) / 86400);
                        return diff;
                    }

                    $scope.$watch('data.expires', function () {
                    })

                    var expires;

                    var checkinTime = moment($scope.data.checkin).utc();
                    var nowInMoment = moment().utc();

                    console.log('nnowInMoment: ' + nowInMoment);
                    console.log('checkinTime: ' + checkinTime);
                    console.log('checkinTime.diff: ' + checkinTime.diff(nowInMoment, 'days'));

                    if (checkinTime.diff(nowInMoment, 'days') == 0) {
                        expires = moment().utc().unix();
                    } else if (checkinTime.diff(nowInMoment, 'days') <= 6) {
                        expires = moment().utc().add(1, 'day').unix();
                    } else if (checkinTime.diff(nowInMoment, 'days') > 6 && checkinTime.diff(nowInMoment, 'days') < 30) {
                        expires = moment().utc().add(5, 'day').unix();
                    } else if (checkinTime.diff(nowInMoment, 'days') >= 30) {
                        expires = moment().utc().add(10, 'day').unix();
                    }


                    var booking = {
                        "property": $scope.data.property.id,
                        "user": {
                            "email": $scope.data.tenant.email,
                            "name": $scope.data.tenant.name
                        },
                        "agent": $scope.returnAgentId(),
                        "agentCommission": $scope.data.agentCommission,
                        "discount": $scope.data.discount.id,
                        "discountPercentage": $scope.data.discount.percent,
                        "checkin": moment.utc($scope.data.checkin, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
                        "checkout": moment.utc($scope.data.checkout, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
                        "status": 0,
                        "currency": $scope.bookingCurrency,
                        "priceExtra": $scope.getFilledExtra(),
                        "paymentType": $scope.data.paymentType,
                        "priceSecurity": $scope.data.priceSecurity,
                        "priceDay": $scope.data.priceDay,
                        "source": $scope.data.source,
                        "created": moment().utc().unix(),
                        "utilitiesElectricity": $scope.data.utilitiesElectricity,
                        "utilitiesWater": $scope.data.utilitiesWater,
                        "utilitiesWifi": $scope.data.utilitiesWifi,
                        "utilitiesCable": $scope.data.utilitiesCable,
                        "rate": $rootScope.currencyRate,
                        "discountAmount": $scope.discountPrice,
                        "cleanfinalprice": $scope.data.property.cleanfinalprice,
                        "cleanprice": $scope.data.property.cleanprice,
                        "expires": expires,
                        "nights": $scope.data.nights,
                        "conditionsAgent": $scope.data.conditionsAgent,
                        "conditionsTenant": $scope.data.conditionsTenant,
                        "pricePaid": 0,
                        "priceReservation": $scope.data.priceReservation,
                        "arrival": $scope.data.arrival,
                        "emails": [],
                        "rentpayday": $scope.data.rentpayday || 0,
                        "nextpayment": nextpaymentDate,
                        "electricPrice": $scope.data.property.electricUnit * ($scope.data.electricTo - $scope.data.electricFrom),
                        "electricFrom": $scope.data.electricFrom,
                        "waterFrom": $scope.data.waterFrom,
                        "waterTo": $scope.data.waterTo,
                        "waterPrice": $scope.data.property.waterUnit * ($scope.data.waterTo - $scope.data.waterFrom),
                        "electricTo": $scope.data.electricTo,
                        "departure": $scope.data.departure,
                        "comment": $scope.data.comment,
                        "longTermDay": $scope.longTheremPayDay.value,
                        "longTermAmount": $scope.longTheremPayPrice.value
                    };

                    Booking.newBooking(booking).then(function (newbooking) {
                        Modal.newBookingManagement(newbooking.data.id);
                        $scope.options.bookingSaved = true;
                        $scope.bookingID = newbooking.data.id;

                        var userCountry = CountryToLanguage.getCountryByName($scope.data.tenant.country).code;

                        $http.post(CONFIG.HELPER_URL + '/booking/setBooking/', {
                            checkin: moment($scope.data.checkin).format('YYYY-MM-DD'),
                            checkout: moment($scope.data.checkout).subtract(1, 'days').format('YYYY-MM-DD'),
                            user: $scope.data.tenant.name,
                            userEmail: $scope.data.tenant.email,
                            userPhone: $scope.data.tenant.phone,
                            userCountry: $scope.data.tenant.country,
                            totalPrice: $scope.valueForRentPrice(),
                            deposit: $scope.data.priceSecurity,
                            th_id: $scope.bookingID,
                            prop: $scope.data.property.unique,
                            status: 0,
                            arrival: $scope.data.arrival
                        }).success(function (data) {
                            console.log("DATA FROM BEDS24 about this booking :", data);
                        });
                    }).catch(function (err) {
                        if (err.data && err.data.errors) {
                            Notification.error({
                                message: JSON.stringify(err.data.errors)
                            });
                        } else {
                            Notification.error({
                                message: JSON.stringify(err.data)
                            });
                        }
                    });
                };
            }]);
})();
