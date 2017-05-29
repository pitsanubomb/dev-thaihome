(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('management.booking', {
                    url: 'booking/:id/:invoice/',
                    controller: 'ManagerNewBookingCtrl',
                    params: {
                        check: false
                    },
                    title: 'title_management_booking',
                    css: ['/css/admin.css'],
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/management/booking/index.html');
                    },
                    resolve: {
                        BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
                            console.log(" BOOKING STATE PARAMS : ", $stateParams);
                            var d = $q.defer();
                            Booking.getDetails($stateParams.id).then(function (data) {
                                d.resolve(data);
                            }).catch(function (err) {
                                d.reject(err, 404);
                            });
                            return d.promise;
                        }]
                    }
                }).state('management.bookingNoparam', {
                url: 'booking/:id/',
                controller: 'ManagerNewBookingCtrl',
                params: {
                    check: false
                },
                title: 'title_management_booking',
                css: ['/css/admin.css'],
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/management/booking/index.html');
                },
                resolve: {
                    BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
                        console.log(" BOOKING STATE PARAMS : ", $stateParams);
                        var d = $q.defer();
                        Booking.getDetails($stateParams.id).then(function (data) {
                            d.resolve(data);
                        }).catch(function (err) {
                            d.reject(err, 404);
                        });
                        return d.promise;
                    }]
                }
            });
        }])
        .run(['$rootScope', '$templateCache', function ($rootScope, $templateCache) {
            $rootScope.$on('$routeChangeStart', function () {
                $templateCache.removeAll();
            });
        }])
        .controller('ManagerNewBookingCtrl',
            ['$scope', '$state', '$stateParams', '$rootScope', 'Modal', 'Calendar', '$timeout', '$http', 'CONFIG', 'Notification', 'Property', 'Locale', 'Booking', 'BookingData', 'Countries', 'User', '$templateCache', 'Payment', 'Email', '$sce', '$filter', 'Invoice', 'Receipt', 'Price', '$location', '$window', 'CountryToLanguage', '$interpolate', '$compile', 'Currency',
                function ($scope, $state, $stateParams, $rootScope, Modal, Calendar, $timeout, $http, CONFIG, Notification, Property, Locale, Booking, BookingData, Countries, User, $templateCache, Payment, Email, $sce, $filter, Invoice, Receipt, Price, $location, $window, CountryToLanguage, $interpolate, $compile, Currency) {
                    $scope.data = BookingData.data;
                    $scope.locationUrlProject = window.location.origin;
                    $scope.locationThis = window.location.href.replace(window.location.pathname, '') + "/";
                    if ($scope.data.discountAmount != '' && Number($scope.data.discountAmount) != 0 && $scope.data.discountAmount != null && typeof $scope.data.discountAmount != 'undefined') {
                        $scope.discountPrice = Number($scope.data.discountAmount);
                        if ($scope.discountPrice > 0) {
                            $scope.discountPrice *= -1;
                        }
                    } else {
                        $scope.discountPrice = '';

                        if ($scope.data.discount.percent) {
                            $scope.discountPrice = Math.round($scope.data.nights * $scope.data.priceDay / 100 * ($scope.data.discount.percent || 1));
                            if ($scope.discountPrice > 0) {
                                $scope.discountPrice *= -1;
                            }
                        }
                    }
                    $scope.reservationBookingProps = {
                        reservation: "",
                        deposit: ""
                    }

                    $scope.$watch('emailLanguage', function () {
                        if (typeof $scope.emailLanguage != 'undefined') {
                            $http.get(CONFIG.API_URL + '/translations/' + $scope.emailLanguage + '.json')
                                .success(function (data) {
                                    $scope.T = data;
                                    $scope.language = $scope.emailLanguage;
                                });
                        }
                    });

                    $scope.openMailForm = function () {
                        $scope.emailLanguage = CountryToLanguage.getLanguageFromCountryName($scope.data.user.country);
                        if ($scope.data.discountAmount > 0) {
                            $scope.data.discountAmount = $scope.data.discountAmount * -1;
                        }
                        $scope.checkedInvoicesForEmail = [];
                        $scope.invoiceGeneratedFileNames = [];
                        $scope.checkedReceiptsForEmail = [];
                        $scope.receiptGeneratedFileNames = [];
                        $scope.balanceSheet = false;
                        $scope.userEmail = $scope.data.user.email;
                        $scope.balanceSheetFile = '';
                        $('#mailLayer').find('input[type=checkbox]:checked').removeAttr('checked');
                        console.log('Email destroyed');
                        if (typeof $scope.emailType != 'undefined') {
                            $scope.getEmailHTML($scope.emailType);
                        }
                    };


                    // $scope. CountryToLanguage.get();

                    $scope.reservationBookingProps.deposit = angular.copy($scope.data.priceSecurity);
                    $scope.reservationBookingProps.reservation = angular.copy($scope.data.priceReservation);

                    $scope.saveAction = false;
                    if ($scope.data.priceSecurity == 0) {
                        $scope.data.priceSecurity = '';
                    }
                    if ($scope.data.priceReservation == 0) {
                        $scope.data.priceReservation = '';
                    }
                    $scope.$watch("discountPrice", function (newVal, old) {
                        console.log('new -> ', newVal, old);
                        console.log($scope.discountPrice);
                        if ($scope.discountPrice > 0) {
                            $scope.discountPrice *= -1;
                        }
                    });
                    $scope.getValueForBookingScource = function (string) {
                        return string.charAt(1);
                    }
                    Price.getPropDetailes($scope.data.property.id)
                        .then(function (data) {
                            $scope.data.propPrice = data[0];
                        });
                    $scope.data.checkin = moment.unix($scope.data.checkin).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
                    $scope.data.checkout = moment.unix($scope.data.checkout).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
                    $scope.tempDataForChange = {
                        data: {
                            "property": $scope.data.property.id,
                            "user": $scope.data.user.id,
                            "agent": $scope.data.agent.id ? $scope.data.agent.id : '',
                            "discount": $scope.data.discount.id,
                            "discountPercentage": $scope.data.discount.percent || "",
                            "discountAmount": $scope.discountPrice ? $scope.discountPrice : '',
                            "checkin": $scope.data.checkin,
                            "checkout": $scope.data.checkout,
                            "status": String($scope.data.status),
                            "priceExtra": $scope.data.extraPrice,
                            "paymentType": $scope.data.paymentType,
                            "priceDay": $scope.data.priceDay,
                            "nights": $scope.data.nights,
                            "conditionsAgent": $scope.data.conditionsAgent || "",
                            "conditionsTenant": $scope.data.conditionsTenant || "",
                            "priceReservation": $scope.data.priceReservation || "",
                            "priceSecurity": $scope.data.priceSecurity || "",
                            "emails": $scope.data.emails,
                            "rentpayday": $scope.data.rentpayday,
                            "comment": $scope.data.comment || "",
                            "source": $scope.data.source,
                            "arrival": $scope.data.arrival || "",
                            "waterFrom": $scope.data.waterFrom || "",
                            "waterTo": $scope.data.waterTo || "",
                            "electricFrom": $scope.data.electricFrom || "",
                            "electricTo": $scope.data.electricTo || "",
                            "departure": $scope.data.departure || ""
                        }
                    };

                    /*page leave alert*/
                    window.onbeforeunload = function (e) {
                        $scope.finalData = {
                            data: {
                                "property": $scope.data.property.id,
                                "user": $scope.data.user.id,
                                "agent": $scope.data.agent.id ? $scope.data.agent.id : '',
                                "discount": $scope.data.discount.id,
                                "discountPercentage": $scope.data.discount.percent || "",
                                "discountAmount": $scope.discountPrice ? $scope.discountPrice : "",
                                "checkin": $scope.data.checkin,
                                "checkout": $scope.data.checkout,
                                "status": String($scope.data.status),
                                "priceExtra": $scope.data.extraPrice,
                                "paymentType": $scope.data.paymentType,
                                "priceDay": $scope.data.priceDay,
                                "nights": $scope.data.nights,
                                "conditionsAgent": $scope.data.conditionsAgent || "",
                                "conditionsTenant": $scope.data.conditionsTenant || "",
                                "priceReservation": $scope.data.priceReservation || "",
                                "priceSecurity": $scope.data.priceSecurity || "",
                                "emails": $scope.data.emails,
                                "rentpayday": $scope.data.rentpayday,
                                "comment": $scope.data.comment || "",
                                "source": $scope.data.source,
                                "arrival": $scope.data.arrival || "",
                                "waterFrom": $scope.data.waterFrom || "",
                                "waterTo": $scope.data.waterTo || "",
                                "electricFrom": $scope.data.electricFrom || "",
                                "electricTo": $scope.data.electricTo || "",
                                "departure": $scope.data.departure || ""
                            }
                        };
                        if (JSON.stringify($scope.finalData) != JSON.stringify($scope.tempDataForChange) && $scope.saveAction != true) {
                            var message = "Press Leave to leave without saving. Press Stay to stay on the booking."
                        }
                        e = e || window.event;
                        if (message) {
                            e.returnValue = message;
                        }
                        return message;
                    };

                    $scope.$on('$stateChangeStart', function (event, next, current) {
                        $scope.finalData = {
                            data: {
                                "property": $scope.data.property.id,
                                "user": $scope.data.user.id,
                                "agent": $scope.data.agent.id ? $scope.data.agent.id : '',
                                "discount": $scope.data.discount.id,
                                "discountPercentage": $scope.data.discount.percent || "",
                                "discountAmount": $scope.discountPrice ? $scope.discountPrice : "",
                                "checkin": $scope.data.checkin,
                                "checkout": $scope.data.checkout,
                                "status": String($scope.data.status),
                                "priceExtra": $scope.data.extraPrice,
                                "paymentType": $scope.data.paymentType,
                                "priceDay": $scope.data.priceDay,
                                "nights": $scope.data.nights,
                                "conditionsAgent": $scope.data.conditionsAgent || "",
                                "conditionsTenant": $scope.data.conditionsTenant || "",
                                "priceReservation": $scope.data.priceReservation || "",
                                "priceSecurity": $scope.data.priceSecurity || "",
                                "emails": $scope.data.emails,
                                "rentpayday": $scope.data.rentpayday,
                                "comment": $scope.data.comment || "",
                                "source": $scope.data.source,
                                "arrival": $scope.data.arrival || "",
                                "waterFrom": $scope.data.waterFrom || "",
                                "waterTo": $scope.data.waterTo || "",
                                "electricFrom": $scope.data.electricFrom || "",
                                "electricTo": $scope.data.electricTo || "",
                                "departure": $scope.data.departure || ""
                            }
                        };
                        if (JSON.stringify($scope.finalData) != JSON.stringify($scope.tempDataForChange) && $scope.saveAction != true) {
                            if (!confirm("Changes will NOT be saved.")) {
                                event.preventDefault();
                                angular.element('.page-loading').addClass('hide');
                            }
                        }
                    });


                    $scope.paymentMethods = Payment.methods();
                    $scope.extraPrice = [];
                    $scope.currentExtraMultiply = [];
                    $scope.voucher = false;//the mail part. Is the voucher selected or not to attach in email.
                    $scope.copyLocation = window.location.href.replace("management/", "");
                    $scope.data.status = $scope.data.status.toString();
                    $scope.emailSendButton = true;
                    $scope.data.priceExtra = $scope.data.priceExtra || [];
                    $scope.sortInvoicesWithDD = function () {
                        $scope.data.invoice = _.sortBy($scope.data.invoice, function (o) {
                            return Math.round(new Date(o.dueDate));
                        });
                    };
                    $scope.sortInvoicesWithDD();
                    $scope.countries = CountryToLanguage.getCountries();

                    $scope.openNewInvoice = function () {
                        if (!$scope.invoiceActionStatus) {
                            $scope.newInvoicepaymentSuggest = $scope.data.paymentType;
                        }
                    }

                    /*tenant area*/

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
                        $scope.currentUserEditable = angular.copy($scope.data.user);
                        console.log($scope.currentUserEditable);
                    }

                    $scope.cancelUserEdit = function () {
                        $scope.data.user = $scope.currentUserEditable;
                        angular.element('#formTenant')[0].style.display = 'none';
                        angular.element('#showTenant')[0].style.display = 'inline';
                    }

                    $scope.saveUser = function () {
                        var currentUser = $scope.userList.filter(function (obj) {
                            return obj.email == $scope.data.user.email;
                        });
                        if (currentUser.length) {

                            $scope.tempDataForChange;
                            User.update(currentUser[0].id, $scope.data.user);
                            Currency.getAll().then(function (data) {
                                var current = data.filter(function (obj) {
                                    return obj.currency == CountryToLanguage.getCurrencyByCountryName($scope.data.user.country)
                                });
                                var currency = '588a25ac3dd9c18b67717a5f';
                                if (current.length) {
                                    currency = current[0].id;
                                }
                                Booking.update($scope.data.id, {currency: currency});
                            });

                            $scope.userEmail = $scope.data.user.email;
                        } else {
                            $scope.data.user.username = $scope.data.user.name;
                            $scope.data.user.password = $scope.data.user.email;
                            $scope.userEmail = $scope.data.user.email;
                            console.log("EMAIL : ", $scope.data.user.email);
                            $scope.data.user.type = 'tenant';
                            User.add($scope.data.user).then(function (data) {
                            });
                            Currency.getAll().then(function (data) {
                                var current = data.filter(function (obj) {
                                    return obj.currency == CountryToLanguage.getCurrencyByCountryName($scope.data.user.country)
                                });
                                var currency = '588a25ac3dd9c18b67717a5f';
                                if (current.length) {
                                    currency = current[0].id;
                                    currency = current[0].id;
                                }
                                Booking.update($scope.data.id, {currency: currency});
                            });
                        }
                    }

                    /*end of tenant area*/
                    $scope.getDateNormalFormat = function (date) {
                        return moment(date).format('DD MMMM YYYY');
                    };

                    $scope.reservationBookingToInvoice = function () {
                        document.getElementById('invoiceForm').style.display = 'block';
                        angular.element('html, body').animate({scrollTop: $('#invoiceForm').position().top}, 500);
                        $scope.invoiceActionStatus = false;
                        $scope.newInvoiceFields = [{
                            lineText: "Reservation / Booking fee",
                            amountPcs: "1 x " + $scope.data.priceReservation,
                            amountTotal: $scope.data.priceReservation
                        }];
                        $scope.newInvoiceTotal = $scope.data.priceReservation;
                        $scope.newInvoiceDueDate = new Date();
                        $scope.gnerateInvoiceNumber();
                        $scope.includeMissing.value = false;
                        $scope.thisInvoiceId = false;
                        $scope.newInvoiceCreateDate = new Date();
                        $scope.newInvoicepaymentSuggest = $scope.data.paymentType;
                        $scope.currentReceipt = {
                            paidDate: new Date(),
                            amount: '',
                            account: 0,
                            managerId: $scope.admin.id,
                            receiptNo: $scope.ReceiptCount + 1
                        };
                        $scope.generateNewReceiptNumber();

                    }

                    if (typeof $scope.data.longTermDay != 'undefined') {
                        $scope.longTheremPayDay = {
                            value: $scope.data.longTermDay
                        };
                        $scope.longTheremPayPrice = {
                            value: $scope.data.longTermAmount
                        };

                    } else {
                        $scope.longTheremPayDay = {
                            value: 1
                        };
                        $scope.longTheremPayPrice = {
                            value: ''
                        };
                    }

                    $scope.checkedInvoicesForEmail = [];

                    $scope.invoiceGeneratedFileNames = [];

                    $scope.checkInvoiceToSendAsEmail = function (id) {
                        var isChecked = $scope.checkedInvoicesForEmail.filter(function (obj) {
                            return obj.id == id;
                        });
                        if (isChecked.length) {
                            $scope.checkedInvoicesForEmail = $scope.checkedInvoicesForEmail.filter(function (obj) {
                                return obj.id != id;
                            });
                            $scope.invoiceGeneratedFileNames = $scope.invoiceGeneratedFileNames.filter(function (obj) {
                                return obj.id != id;
                            });
                        } else {
                            var current = $scope.data.invoice.filter(function (obj) {
                                return obj.id == id;
                            });
                            $scope.checkedInvoicesForEmail.push(current[0]);
                            $scope.emailSendButton = false;
                            $timeout(function () {
                                $http.post(CONFIG.API_URL + '/pdfinvoice', {
                                    "url": $($('#invoicePdfArea').find('.container.' + id)).html(),
                                    "number": current[0].invoiceNumber
                                }).success(function (data) {
                                    $scope.invoiceGeneratedFileNames.push({
                                        id: id,
                                        file: data.filename
                                    })
                                    $scope.emailSendButton = true;
                                });
                            }, 1000);
                        }
                        $scope.getEmailHTML($scope.emailType);

                    };

                    $scope.checkedReceiptsForEmail = [];
                    $scope.receiptGeneratedFileNames = [];

                    $scope.checkReceiptToSendAsEmail = function (id) {
                        var isChecked = $scope.checkedReceiptsForEmail.filter(function (obj) {
                            return obj.id == id;
                        });
                        if (isChecked.length) {
                            $scope.checkedReceiptsForEmail = $scope.checkedReceiptsForEmail.filter(function (obj) {
                                return obj.id != id;
                            });
                            $scope.receiptGeneratedFileNames = $scope.receiptGeneratedFileNames.filter(function (obj) {
                                return obj.id != id;
                            });
                        } else {
                            var current = $scope.data.receipt.filter(function (obj) {
                                return obj.id == id;
                            });
                            $scope.checkedReceiptsForEmail.push(current[0]);

                            $scope.emailSendButton = false;
                            $timeout(function () {
                                $http.get(CONFIG.API_URL + '/pdfreceipt', {
                                    params: {
                                        "url": $($('#receiptPdfArea').find('.container.' + id)).html(),
                                        "number": current[0].receiptNo
                                        //$($('#invoicePdfArea').find('.container')[0]).html()
                                    }
                                }).success(function (data) {
                                    $scope.emailSendButton = true;
                                    $scope.receiptGeneratedFileNames.push({
                                        id: id,
                                        file: data.filename
                                    })
                                });
                            }, 1000);
                        }
                        $scope.getEmailHTML($scope.emailType);
                    };


                    // datepicker props for due date

                    $scope.newInvoiceDueDate = new Date();
                    $scope.minDate = new Date(
                        $scope.newInvoiceDueDate.getFullYear(),
                        $scope.newInvoiceDueDate.getMonth() - 2,
                        $scope.newInvoiceDueDate.getDate());
                    $scope.maxDate = new Date(
                        $scope.newInvoiceDueDate.getFullYear(),
                        $scope.newInvoiceDueDate.getMonth() + 2,
                        $scope.newInvoiceDueDate.getDate());
                    $scope.onlyWeekendsPredicate = function (date) {
                        var day = date.getDay();
                        return day === 0 || day === 6;
                    };


                    $scope.currentReceipt = {
                        paidDate: new Date(),
                        amount: '',
                        account: 0,
                        managerId: $scope.admin.id,
                        receiptNo: 1
                    };

                    $scope.currentReceipt.paidDate = new Date();
                    $scope.minDateForReceipt = new Date(
                        $scope.currentReceipt.paidDate.getFullYear(),
                        $scope.currentReceipt.paidDate.getMonth() - 2,
                        $scope.currentReceipt.paidDate.getDate());
                    $scope.maxDateForReceipt = new Date(
                        $scope.currentReceipt.paidDate.getFullYear(),
                        $scope.currentReceipt.paidDate.getMonth() + 2,
                        $scope.currentReceipt.paidDate.getDate());
                    $scope.onlyWeekendsPredicate = function (date) {
                        var day = date.getDay();
                        return day === 0 || day === 6;
                    };

                    $scope.emailFieldColor = "background-color:#ff9999";


                    $scope.showHideInvoices = true;

                    // new invoice props
                    $scope.bookingInvoices = [];
                    $scope.thisInvoiceId = false;
                    $scope.newInvoiceFields = [];
                    $scope.newInvoiceTotal = 0;
                    $scope.newInvoiceDueDate = new Date();
                    $scope.includeMissing = {
                        value: false
                    };
                    $scope.newInvoiceNumber = 0;
                    $scope.newInvoiceCreateDate = new Date();
                    $scope.newInvoicepaymentSuggest = 0;
                    $scope.invoiceActionStatus = false;

                    $scope.receiptActionStatus = false;

                    $scope.includedMissingPirce = false;

                    $scope.gnerateInvoiceNumber = function () {
                        Invoice.list().then(function (data) {
                            if (data.length) {
                                $scope.newInvoiceNumber = data[data.length - 1].invoiceNumber + 1;
                            } else {
                                $scope.newInvoiceNumber = 1;
                            }
                        });
                    }
                    //$scope.gnerateInvoiceNumber();


                    $scope.generateNewReceiptNumber = function () {
                        Receipt.getAll().then(function (data) {
                            if (data.length) {
                                $scope.currentReceipt.receiptNo = data[data.length - 1].receiptNo + 1;
                            }
                        });
                    }
                    $scope.generateNewReceiptNumber();

                    $scope.calculateTotalReceipts = function () {
                        var totalPrice = 0;
                        for (var i = 0; i < $scope.data.receipt.length; i++) {
                            totalPrice += $scope.data.receipt[i].amount;
                        }
                        return totalPrice;
                    };
                    $scope.calculateTotalPaidInvoices = function () {
                        var totalPrice = 0;
                        for (var i = 0; i < $scope.data.invoice.length; i++) {
                            if ($scope.data.invoice[i].paidDate) {
                                totalPrice += $scope.getInvoiceTotal($scope.data.invoice[i]);
                            }
                        }
                        return totalPrice;
                    }

                    $scope.validateInvoiceNumber = function () {
                        if ($scope.newInvoiceNumber == 0) {
                            return true;
                        } else {
                            var status = false;
                            for (var i = 0; i < $scope.data.invoice.length; i++) {
                                if ($scope.newInvoiceNumber == $scope.data.invoice[i].invoiceNumber) {
                                    $scope.currentReceipt.invoiceId = $scope.data.invoice[i].id;
                                    status = true;
                                }
                            }
                            if (!status) {
                                $scope.currentReceipt.invoiceId = "";
                            }
                            return status;
                        }
                    }

                    $scope.calculateTotalInvoices = function () {
                        var totalPrice = 0;
                        for (var i = 0; i < $scope.data.invoice.length; i++) {
                            totalPrice += Number($scope.getInvoiceTotal($scope.data.invoice[i]));
                        }
                        return totalPrice;
                    };
                    $scope.isMissingPriceIncluded = function () {
                        $scope.includedMissingPirce = false;
                        for (var i = 0; i < $scope.data.invoice.length; i++) {
                            if ($scope.data.invoice[i].includeMissing && $scope.data.invoice[i].paidDate == '') {
                                $scope.includedMissingPirce = true;
                            }
                        }
                    };
                    $scope.$watch('data.invoice', function () {
                        $scope.isMissingPriceIncluded();
                    });
                    $scope.invlucedMissingPaymentInInvoice = function () {
                        if ($scope.thisInvoiceId) {
                            for (var i = 0; i < $scope.data.invoice.length; i++) {
                                if ($scope.thisInvoiceId == $scope.data.invoice[i].id) {
                                    $scope.data.invoice[i].includeMissing = $scope.includeMissing.value;
                                }
                            }
                        }
                        $scope.isMissingPriceIncluded();
                    }

                    $scope.$watch('includeMissing.value', function () {
                        $scope.invlucedMissingPaymentInInvoice();
                    });

                    $scope.calculateMissingPrice = function () {
                        var mustPay = 0;
                        for (var i = 0; i < $scope.data.invoice.length; i++) {
                            if ($scope.data.invoice[i].paidDate != '') {
                                mustPay += $scope.getInvoiceTotal($scope.data.invoice[i]);
                            }
                        }

                        var payedAmount = 0;
                        for (var j = 0; j < $scope.data.receipt.length; j++) {
                            payedAmount += $scope.data.receipt[j].amount;
                        }

                        return mustPay - payedAmount;
                    };

                    $scope.isMissingInvoicePrice = function (id) {
                        if (typeof id != 'undefined') {
                            var invoice = $scope.data.invoice.filter(function (obj) {
                                return obj.id == id;
                            });
                            if (typeof invoice[0] != 'undefined') {
                                if (invoice[0].includeMissing) {
                                    return $scope.calculateMissingPrice();
                                } else {
                                    return 0;
                                }
                            }
                        }
                    }

                    $scope.getAlreadyPayed = function () {
                        var payedAmount = 0;
                        for (var j = 0; j < $scope.data.receipt.length; j++) {
                            payedAmount += $scope.data.receipt[j].amount;
                        }
                        return payedAmount;
                    };

                    $scope.payForArrive = function () {
                        return $scope.calculateTotalInvoices() - $scope.calculateTotalReceipts();
                    }

                    $scope.newReceiptOpen = function () {
                        $scope.newInvoiceNumber = 0;
                        console.log($scope.newInvoiceNumber);
                        document.getElementById('receiptForm').style.display = 'inline';
                        $scope.$apply();
                    };

                    $scope.onDayPriceChange = function () {
                        $scope.data.priceDay = $("#datePriceField").val();
                        $scope.valueForRentPrice();
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
                        $scope.$apply();
                    }

                    $scope.getDayPrice = function () {

                        $scope.tempDataForChange.data.discountAmount = $scope.discountPrice ? $scope.discountPrice : '';
                        $scope.valueForRentPrice();
                        $("#totalPriceInput").val(Math.round($scope.valueForRentPrice()));
                        return $scope.data.priceDay;
                    }

                    $scope.onRentPriceChange = function () {

                        $scope.tempDataForChange.data.discountAmount = $scope.discountPrice ? $scope.discountPrice : '';
                        $scope.data.priceDay = Number($("#totalPriceInput").val()) / $scope.data.nights;
                        $scope.valueForRentPrice();
                        $('#datePriceField').val(Math.round($scope.data.priceDay));
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

                    Receipt.getAll().then(function (data) {
                        $scope.ReceiptCount = data.length;
                    });


                    $scope.emailFinalPayment = function () {
                        var mustPay = 0;
                        for (var i = 0; i < $scope.data.invoice.length; i++) {
                            if ($scope.data.invoice[i].paidDate != '') {
                                mustPay += $scope.getInvoiceTotal($scope.data.invoice[i]);
                            }
                        }

                        var payedAmount = 0;
                        for (var j = 0; j < $scope.data.receipt.length; j++) {
                            payedAmount += $scope.data.receipt[j].amount;
                        }

                        if ((mustPay - payedAmount) > 0) {
                            return $scope.T.transMailFinal;
                        }
                    }

                    $scope.getPaidDateFromString = function (date) {
                        return new Date(date);
                    };

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

                    $scope.autoGenerateInvoice = function (i) {
                        $scope.newInvoiceFields = [];
                        $scope.newInvoiceFields.push({
                            lineText: "Rent Price",
                            amountPcs: $scope.data.nights + " x " + $scope.data.priceDay,
                            amountTotal: ($scope.data.nights * $scope.data.priceDay)
                        });

                        if ($scope.discountPrice) {
                            var discountCode = "";
                            if (typeof $scope.data.discount.code != 'undefined') {
                                discountCode = "(" + $scope.data.discount.code + ")"
                            }

                            var discountPercent = "";
                            if ($scope.data.discount.percent != 0) {
                                discountPercent = $scope.data.discount.percent + "%";
                            }
                            $scope.newInvoiceFields.push({
                                lineText: "Discount" + discountCode,
                                amountPcs: discountPercent,
                                amountTotal: $scope.discountPrice
                            });
                        }

                        for (var i = 0; i < $scope.data.priceExtra.length; i++) {
                            $scope.newInvoiceFields.push({
                                lineText: $scope.data.priceExtra[i].name,
                                amountPcs: $scope.data.priceExtra[i].calc,
                                amountTotal: $scope.data.priceExtra[i].price
                            })
                        }

                        $scope.newInvoiceFields.push({
                            lineText: "Reservation fee paid already",
                            amountPcs: "1 x -" + $scope.data.priceReservation,
                            amountTotal: Number($scope.data.priceReservation * -1)
                        });
                        $scope.calculateNewInvoiceTotal();
                    };

                    $scope.longTheremAutoStatus = true;

                    $scope.auotGenerateLongThermInvoices = function () {//autegenerating invoices one by one for long therm
                        $scope.longTheremAutoStatus = false;
                        function generateLongThermInvoices() {
                            $scope.newInvoicepaymentSuggest = $scope.data.paymentType;
                            Invoice.add({
                                invoiceNumber: $scope.newInvoiceNumber,
                                bookingId: $scope.data.id,
                                propertyId: $scope.data.property.id,
                                createDate: Math.round(new Date($scope.newInvoiceCreateDate) / 1000),
                                dueDate: Math.round(new Date($scope.newInvoiceDueDate) / 1000),
                                paidDate: false,
                                paymentSuggest: $scope.newInvoicepaymentSuggest,
                                managerId: $scope.admin.id,
                                invoiceLines: $scope.newInvoiceFields,
                                includeMissing: $scope.includeMissing.value
                            }).then(function (data) {
                                Notification.success({
                                    message: 'Created a new invoice.'
                                });
                                $scope.data.invoice.push({
                                    id: data.id,
                                    invoiceNumber: data.invoiceNumber,
                                    bookingId: data.bookingId,
                                    propertyId: data.propertyId,
                                    createDate: Math.round(new Date($scope.createDate) / 1000),
                                    dueDate: Math.round(new Date($scope.dueDate) / 1000),
                                    paidDate: false,
                                    paymentSuggest: data.paymentSuggest,
                                    managerId: data.managerId,
                                    invoiceLines: data.invoiceLines,
                                    includeMissing: data.includeMissing
                                });
                                $scope.newInvoiceFields = [];
                                $scope.newInvoiceTotal = 0;
                                $scope.newInvoiceDueDate = new Date();
                                $scope.bookingInvoices = [];
                                $scope.gnerateInvoiceNumber();
                                $scope.includeMissing.value = false;
                                $scope.thisInvoiceId = false;
                                $scope.newInvoiceCreateDate = new Date();
                                $scope.newInvoicepaymentSuggest = 0;
                                $scope.invoiceActionStatus = false;
                                i++;
                                longThermInvoiceBuilder(i);
                            });
                        }

                        var checkin = moment($scope.data.checkin);
                        var checkout = moment($scope.data.checkout);
                        var months = checkout.diff(checkin, 'months');
                        var i = 0;

                        function longThermInvoiceBuilder(i) {
                            if (i < months + 1) {
                                var checkin = moment($scope.data.checkin);
                                var checkout = moment($scope.data.checkout);
                                var invouiceStartDate = moment(moment($scope.data.checkin).add(i, 'months'));
                                var invoiceEndDate = moment(moment($scope.data.checkin).add(i + 1, 'months'));
                                if (i == 0) {
                                    if ($scope.longTheremPayDay.value > invouiceStartDate.date()) {
                                        var duDateForInvoice = new Date(invouiceStartDate.month() + 1 + "/" + invouiceStartDate.date() + "/" + invouiceStartDate.year())
                                    } else {
                                        var duDateForInvoice = new Date(invouiceStartDate.month() + 1 + "/" + $scope.longTheremPayDay.value + "/" + invouiceStartDate.year())
                                    }
                                    $scope.newInvoiceFields = [{
                                        lineText: "From " + $scope.getDateNormalFormat(invouiceStartDate) + " to " + $scope.getDateNormalFormat(invoiceEndDate),
                                        amountPcs: "1 x " + $scope.longTheremPayPrice.value,
                                        amountTotal: $scope.longTheremPayPrice.value
                                    }];
                                    $scope.newInvoiceTotal = $scope.longTheremPayPrice.value;
                                    $scope.newInvoiceDueDate = Math.round(new Date(duDateForInvoice) / 1000);
                                    $scope.gnerateInvoiceNumber();
                                    $scope.includeMissing.value = false;
                                    $scope.thisInvoiceId = false;
                                    $scope.newInvoiceCreateDate = Math.round(new Date() / 1000);
                                    $scope.newInvoicepaymentSuggest = 0;
                                    generateLongThermInvoices();
                                } else {
                                    if (checkout.diff(invoiceEndDate, 'days') < 0) {
                                        console.log('diff dates', checkout.date(), invouiceStartDate.date());
                                        if (invouiceStartDate.date() != checkout.date()) {
                                            invoiceEndDate = checkout;
                                            var dueDateGenerated = Math.round(new Date(invouiceStartDate.month() + 1 + "/" + $scope.longTheremPayDay.value + "/" + invouiceStartDate.year()) / 1000)
                                            if (dueDateGenerated > Math.round(new Date(invoiceEndDate.month() + 1 + "/" + invoiceEndDate.date() + "/" + invoiceEndDate.year()) / 1000)) {
                                                var duDateForInvoice = new Date(invoiceEndDate.month() + 1 + "/" + invoiceEndDate.date() + "/" + invoiceEndDate.year())
                                            } else {
                                                var duDateForInvoice = new Date(invouiceStartDate.month() + 1 + "/" + $scope.longTheremPayDay.value + "/" + invouiceStartDate.year());
                                            }

                                            $scope.newInvoiceFields = [{
                                                lineText: "From " + $scope.getDateNormalFormat(invouiceStartDate) + " to " + $scope.getDateNormalFormat(checkout),
                                                amountPcs: "1 x " + Math.round($scope.longTheremPayPrice.value / 30) * ((Math.round(new Date(checkout) / 1000) - Math.round(new Date(invouiceStartDate) / 1000)) / 86400 ),
                                                amountTotal: Math.round($scope.longTheremPayPrice.value / 30) * ((Math.round(new Date(checkout) / 1000) - Math.round(new Date(invouiceStartDate) / 1000)) / 86400 )
                                            }];
                                            $scope.newInvoiceTotal = $scope.data.priceDay * checkout.diff(invoiceEndDate, 'days') * -1;
                                            $scope.newInvoiceDueDate = Math.round(new Date(duDateForInvoice) / 1000);
                                            $scope.gnerateInvoiceNumber();
                                            $scope.includeMissing.value = false;
                                            $scope.newInvoiceCreateDate = Math.round(new Date() / 1000);
                                            $scope.newInvoicepaymentSuggest = 0;
                                            generateLongThermInvoices();
                                        }
                                    } else {
                                        var duDateForInvoice = new Date(invouiceStartDate.month() + 1 + "/" + $scope.longTheremPayDay.value + "/" + invouiceStartDate.year())
                                        $scope.newInvoiceFields = [{
                                            lineText: "From " + $scope.getDateNormalFormat(invouiceStartDate) + " to " + $scope.getDateNormalFormat(invoiceEndDate),
                                            amountPcs: "1 x " + $scope.longTheremPayPrice.value,
                                            amountTotal: $scope.longTheremPayPrice.value
                                        }];
                                        $scope.newInvoiceTotal = $scope.longTheremPayPrice.value;
                                        $scope.newInvoiceDueDate = Math.round(new Date(duDateForInvoice) / 1000);
                                        $scope.gnerateInvoiceNumber();
                                        $scope.includeMissing.value = false;
                                        $scope.thisInvoiceId = false;
                                        $scope.newInvoiceCreateDate = Math.round(new Date() / 1000);
                                        $scope.newInvoicepaymentSuggest = 0;
                                        generateLongThermInvoices();
                                    }
                                }
                            }
                        }

                        longThermInvoiceBuilder(i);
                    }

                    $scope.addReceipt = function () {
                        if ( ($scope.currentReceipt.amount != 0 || $scope.currentReceipt.amount != '') && ($scope.currentReceipt.account != '0') ) {
                            if (!$scope.receiptActionStatus) {
                                if ($scope.thisInvoiceId == "" && $scope.newInvoiceNumber > 0) {
                                    var currentinvoice = $scope.data.invoice.filter(function (obj) {
                                        return obj.invoiceNumber == $scope.newInvoiceNumber;
                                    })
                                    $scope.newInvoiceFields = currentinvoice[0].invoiceLines;
                                    $scope.newInvoiceTotal = $scope.getInvoiceTotal(currentinvoice[0]);
                                    $scope.newInvoiceDueDate = currentinvoice[0].dueDate;
                                    $scope.newInvoiceNumber = currentinvoice[0].invoiceNumber;
                                    $scope.includeMissing.value = currentinvoice[0].includeMissing;
                                    $scope.newInvoiceCreateDate = currentinvoice[0].createDate;
                                    $scope.newInvoicepaymentSuggest = currentinvoice[0].paymentSuggest;
                                    $scope.thisInvoiceId = currentinvoice[0].id;
                                    $scope.currentReceipt.invoiceId = currentinvoice[0].id
                                } else {
                                    //$scope.currentReceipt.invoiceId = "";
                                }
                                $scope.currentReceipt.managerId = $scope.admin.id;
                                $scope.currentReceipt.bookingId = $scope.data.id;
                                $scope.currentReceipt.paidDate = Math.round(new Date($scope.currentReceipt.paidDate) / 1000);
                                Receipt.add($scope.currentReceipt)
                                    .then(function (data) {
                                        $scope.data.receipt.push(data);
                                        Notification.success({
                                            message: 'New receipt created.'
                                        });
                                        if ($scope.newInvoiceNumber) {
                                            //@todo put here the invoice creating. So if the number is 0 no need to update, create/invoice

                                            Invoice.add({//updating invoice for paid date
                                                id: $scope.thisInvoiceId,
                                                invoiceNumber: $scope.newInvoiceNumber,
                                                bookingId: $scope.data.id,
                                                propertyId: $scope.data.property.id,
                                                createDate: $scope.newInvoiceCreateDate,
                                                dueDate: Math.round(new Date($scope.newInvoiceDueDate) / 1000),
                                                paidDate: true,
                                                paymentSuggest: $scope.newInvoicepaymentSuggest,
                                                managerId: $scope.admin.id,
                                                invoiceLines: $scope.newInvoiceFields,
                                                includeMissing: $scope.includeMissing.value
                                            }).then(function (data) {
                                                for (var i = 0; i < $scope.data.invoice.length; i++) {
                                                    if ($scope.data.invoice[i].id == data.id) {
                                                        $scope.data.invoice[i].paidDate = true;
                                                    }
                                                }

                                                $scope.newInvoiceFields = [{
                                                    lineText: "",
                                                    amountPcs: "",
                                                    amountTotal: ''
                                                }];

                                                $scope.newInvoiceTotal = 0;
                                                $scope.newInvoiceDueDate = Math.round(new Date() / 1000);
                                                $scope.gnerateInvoiceNumber();
                                                $scope.newInvoiceCreateDate = Math.round(new Date() / 1000);
                                                $scope.includeMissing.value = false;
                                                $scope.thisInvoiceId = false;
                                                $scope.newInvoicepaymentSuggest = 0;
                                                $scope.invoiceActionStatus = false;
                                                $scope.currentReceipt = {
                                                    paidDate: new Date(),
                                                    amount: '',
                                                    account: 0,
                                                    managerId: $scope.admin.id,
                                                    receiptNo: $scope.ReceiptCount + 1,
                                                    bookingId: $scope.data.id,
                                                    invoiceId: $scope.thisInvoiceId
                                                };
                                                $scope.generateNewReceiptNumber();
                                                document.getElementById('invoiceForm').style.display = 'none';
                                            });
                                        } else {
                                            $scope.newInvoiceFields = [{
                                                lineText: "",
                                                amountPcs: "",
                                                amountTotal: ""
                                            }];

                                            $scope.newInvoiceTotal = 0;
                                            $scope.newInvoiceDueDate = new Date();
                                            $scope.gnerateInvoiceNumber();
                                            $scope.newInvoiceCreateDate = new Date();
                                            $scope.includeMissing.value = false;
                                            $scope.thisInvoiceId = false;
                                            $scope.newInvoicepaymentSuggest = 0;
                                            $scope.invoiceActionStatus = false;
                                            $scope.currentReceipt = {
                                                paidDate: new Date(),
                                                amount: '',
                                                account: 0,
                                                managerId: $scope.admin.id,
                                                receiptNo: $scope.ReceiptCount + 1,
                                                bookingId: $scope.data.id,
                                                invoiceId: $scope.thisInvoiceId
                                            };
                                            $scope.generateNewReceiptNumber();
                                            document.getElementById('invoiceForm').style.display = 'none';
                                        }
                                    })
                            } else {
                                $scope.currentReceipt.paidDate = Math.round(new Date($scope.currentReceipt.paidDate) / 1000);
                                Receipt.update($scope.currentReceipt).then(function (data) {
                                    for (var i = 0; i < $scope.data.receipt.length; i++) {
                                        if (data.id == $scope.data.receipt[i].id) {
                                            console.log(data);
                                            $scope.data.receipt[i] = data;
                                            console.log('receipts', $scope.data.receipt[i]);
                                        }
                                    }
                                    Notification.success({
                                        message: 'Receipt Updated.'
                                    });
                                });
                                $scope.currentReceipt = {
                                    paidDate: new Date(),
                                    amount: '',
                                    account: 0,
                                    managerId: $scope.admin.id,
                                    receiptNo: $scope.ReceiptCount + 1,
                                    bookingId: $scope.data.id,
                                    invoiceId: $scope.thisInvoiceId
                                };
                                $scope.receiptActionStatus = false;
                            }
                            document.getElementById('receiptForm').style.display = 'none';
                        }
                    };

                    $scope.invoiceDDlineColor = function (item) {

                        if (!item.paidDate && Number($scope.getDueDateForInvoice(item.dueDate * 1000).days) > 0) {
                            return "";
                        } else {
                            if (Number($scope.getDueDateForInvoice(item.dueDate * 1000).days) < 0) {
                                return "litred";
                            }
                        }
                    };

                    $scope.invoiceDDlineTextColor = function (item) {

                        if (item.paidDate != "" && item.paidDate != false) {
                            return "#000;";
                        } else {
                            if (Number($scope.getDueDateForInvoice(item.dueDate * 1000).days) < 0) {
                                return "#FF0000;font-weight: bold !important;";
                            }
                        }
                    };

                    $scope.editInvoice = function (invoice) {
                        $scope.invoiceActionStatus = true;
                        $scope.newInvoiceFields = invoice.invoiceLines;
                        $scope.newInvoiceTotal = $scope.getInvoiceTotal(invoice);
                        $scope.newInvoiceDueDate = new Date(Number(invoice.dueDate) * 1000);
                        $scope.newInvoiceNumber = invoice.invoiceNumber;
                        $scope.includeMissing.value = invoice.includeMissing;
                        $scope.newInvoiceCreateDate = invoice.createDate;
                        $scope.newInvoicepaymentSuggest = invoice.paymentSuggest;
                        $scope.thisInvoiceId = invoice.id;
                        var invoiceReceipt = $scope.data.receipt.filter(function (obj) {
                            return obj.invoiceId == $scope.thisInvoiceId;
                        });
                        if (invoiceReceipt.length) {
                            $scope.currentReceipt = invoiceReceipt[0];
                            $scope.currentReceipt.paidDate = new Date($scope.currentReceipt.paidDate * 1000);
                        } else {
                            $scope.currentReceipt = {
                                paidDate: Math.round(new Date() / 1000),
                                amount: '',
                                account: 0,
                                managerId: $scope.admin.id,
                                receiptNo: $scope.ReceiptCount + 1,
                                invoiceId: $scope.thisInvoiceId,
                                bookingId: $scope.data.id
                            };
                            $scope.generateNewReceiptNumber();
                        }
                        $scope.sortInvoicesWithDD();
                        document.getElementById('invoiceForm').style.display = 'inline';
                        angular.element('html, body').animate({scrollTop: $('#invoiceForm').position().top}, 500);
                    };

                    $scope.editReceipt = function (receipt) {
                        $scope.currentReceipt = {
                            paidDate: new Date(receipt.paidDate * 1000),
                            id: receipt.id,
                            amount: receipt.amount,
                            account: receipt.account,
                            managerId: receipt.managerId,
                            receiptNo: receipt.receiptNo,
                            invoiceId: receipt.invoiceId,
                            bookingId: receipt.bookingId
                        };

                        var invoiceOfCurrentReceipt = $scope.data.invoice.filter(function (obj) {
                            return obj.id == $scope.currentReceipt.invoiceId;
                        });


                        if (invoiceOfCurrentReceipt.length) {
                            $scope.newInvoiceNumber = invoiceOfCurrentReceipt[0].invoiceNumber;
                        } else {
                            $scope.newInvoiceNumber = 0;
                        }

                        $scope.receiptActionStatus = true;
                    };


                    $timeout(function () {
                        var checkForInvoice = function () {
                            if (typeof $scope.data != 'undefined') {
                                if ($stateParams.invoice != '' && typeof $stateParams.invoice != 'undefined') {
                                    console.log(" INVOICES : ", $scope.data.invoice);
                                    var current = $scope.data.invoice.filter(function (obj) {
                                        return obj.id == $stateParams.invoice;
                                    });
                                    if (current.length != 0) {
                                        $scope.editInvoice(current[0]);
                                    } else {
                                        $timeout(function () {
                                            checkForInvoice();
                                        }, 400);
                                    }
                                }
                            } else {
                                $timeout(function () {
                                    checkForInvoice();
                                }, 400);
                            }
                        };
                        checkForInvoice();
                    }, 600);

                    $scope.$watch('newInvoiceNumber', function () {
                        console.log("CHANGE : ", $scope.newInvoiceNumber);
                    })

                    $scope.getInvoiceNumberForReceipt = function (invoiceId) {
                        if (invoiceId == "") {
                            return "";
                        } else {
                            var invoiceForReceiptNumber = $scope.data.invoice.filter(function (obj) {
                                return obj.id == invoiceId;
                            });

                            if (invoiceForReceiptNumber.length) {
                                return " ( Invoice No " + invoiceForReceiptNumber[0].invoiceNumber + ")";
                            } else {
                                return "";
                            }
                        }
                    }

                    $scope.deleteReceipt = function (id) {
                        Receipt.delete(id).then(function (data) {
                            Notification.success({
                                message: 'Receipt deleted.'
                            });

                            $scope.data.receipt = $scope.data.receipt.filter(function (obj) {
                                return obj.id != id;
                            });

                            var thisInvoice = $scope.data.invoice.filter(function (obj) {
                                return obj.id == $scope.currentReceipt.invoiceId;
                            });
                            console.log(" CURRENCT INVOICE DATA : ", thisInvoice[0]);
                            thisInvoice[0].paidDate = false;
                            Invoice.update(thisInvoice[0]).then(function (data) {
                                for (var i = 0; i < $scope.data.invoice.length; i++) {
                                    if ($scope.currentReceipt.invoiceId == $scope.data.invoice[i].id) {
                                        $scope.data.invoice[i].paidDate = false;
                                    }
                                }
                            });

                            $scope.currentReceipt = {
                                paidDate: new Date(),
                                amount: '',
                                account: 0,
                                managerId: $scope.admin.id,
                                receiptNo: $scope.ReceiptCount + 1,
                                invoiceId: $scope.thisInvoiceId,
                                bookingId: $scope.data.id
                            };
                            $scope.generateNewReceiptNumber();
                            $scope.receiptActionStatus = false;
                        });
                    };

                    $scope.deleteInvoice = function (id) {
                        $scope.data.invoice = $scope.data.invoice.filter(function (obj) {
                            return obj.id != id;
                        });
                        Invoice.delete(id).then(function (data) {
                            Notification.success({
                                message: 'Invoice deleted.'
                            });

                        });
                        var receiptOfInvoice = $scope.data.receipt.filter(function (obj) {
                            return obj.invoiceId == id;
                        });

                        if (receiptOfInvoice.length) {
                            Receipt.delete(receiptOfInvoice[0].id)
                            $scope.currentReceipt = {
                                paidDate: Math.round(new Date() / 1000),
                                amount: '',
                                account: 0,
                                managerId: $scope.admin.id,
                                receiptNo: $scope.ReceiptCount + 1
                            };
                            $scope.generateNewReceiptNumber();
                        }

                        $scope.cancelInvoice();
                        $scope.sortInvoicesWithDD();
                    };
                    $scope.convertBillsToInvoice = function () {
                        document.getElementById('invoiceForm').style.display = 'block';
                        $scope.invoiceActionStatus = false;
                        $scope.newInvoiceFields = [{
                            lineText: "Electric",
                            amountPcs: $scope.data.electricTo - $scope.data.electricFrom + " x " + $scope.data.property.electricUnit,
                            amountTotal: ($scope.data.electricTo - $scope.data.electricFrom) * $scope.data.property.electricUnit
                        }, {
                            lineText: "Water",
                            amountPcs: $scope.data.waterTo - $scope.data.waterFrom + " x " + $scope.data.property.waterUnit,
                            amountTotal: ($scope.data.waterTo - $scope.data.waterFrom) * $scope.data.property.waterUnit
                        }];
                        $scope.newInvoiceTotal = ($scope.data.waterTo - $scope.data.waterFrom) * $scope.data.property.waterUnit + ($scope.data.electricTo - $scope.data.electricFrom) * $scope.data.property.electricUnit;
                        $scope.newInvoiceDueDate = new Date();
                        $scope.gnerateInvoiceNumber();
                        $scope.includeMissing.value = false;
                        $scope.thisInvoiceId = false;
                        $scope.newInvoiceCreateDate = new Date();
                        $scope.newInvoicepaymentSuggest = $scope.data.paymentType;
                        $scope.invoiceActionStatus = false;
                        $scope.currentReceipt = {
                            paidDate: true,
                            amount: '',
                            account: 0,
                            managerId: $scope.admin.id,
                            receiptNo: $scope.ReceiptCount + 1
                        };
                        $scope.generateNewReceiptNumber();
                    }

                    $scope.cnacelReceipt = function () {
                        $scope.currentReceipt = {
                            paidDate: new Date(),
                            amount: '',
                            account: 0,
                            managerId: $scope.admin.id,
                            receiptNo: $scope.ReceiptCount + 1
                        };
                        $scope.generateNewReceiptNumber();

                        $scope.receiptActionStatus = false;
                    }

                    $scope.cancelInvoice = function () {
                        $scope.invoiceActionStatus = false;
                        $scope.newInvoiceFields = [{
                            lineText: "",
                            amountPcs: "",
                            amountTotal: ''
                        }];
                        $scope.newInvoiceTotal = 0;
                        $scope.newInvoiceDueDate = new Date();
                        $scope.gnerateInvoiceNumber();
                        $scope.includeMissing.value = false;
                        $scope.newInvoiceCreateDate = new Date();
                        $scope.newInvoicepaymentSuggest = 0;
                        $scope.invoiceActionStatus = false;
                        $scope.thisInvoiceId = false;
                        $scope.currentReceipt = {
                            paidDate: new Date(),
                            amount: '',
                            account: 0,
                            managerId: $scope.admin.id,
                            receiptNo: $scope.ReceiptCount + 1
                        };
                        $scope.generateNewReceiptNumber();
                    };

                    $scope.getInvoiceTotal = function (invoice) {
                        var total = 0;
                        for (var i = 0; i < invoice.invoiceLines.length; i++) {
                            total += invoice.invoiceLines[i].amountTotal;
                        }
                        return total;
                    };

                    $scope.getindependantReceipts = function () {
                        var independantReceipts = $scope.data.receipt.filter(function (obj) {
                            return obj.invoiceId == "";
                        });
                        return independantReceipts;
                    }

                    $scope.getReceiptsByInvoiceId = function (id) {
                        var receipts = $scope.data.receipt.filter(function (obj) {
                            return obj.invoiceId == id;
                        });
                        return receipts;
                    }

                    $scope.balanceSheetReceipts = [];

                    $scope.collectReceiptsForBalanceSheet = function () {
                        var invoices = $scope.data.invoice;
                        var receipts = $scope.data.receipt;
                        $scope.balanceSheetReceipts = [];
                        for (var i = 0; i < invoices.length; i++) {
                            var current = receipts.filter(function (obj) {
                                return obj.invoiceId == invoices[i].id;
                            });

                            if (current.length) {
                                $scope.balanceSheetReceipts.push({
                                    paidDate: current[0].paidDate,
                                    amount: current[0].amount,
                                    missing: $scope.getInvoiceTotal(invoices[i]) - current[0].amount
                                })
                            } else {
                                $scope.balanceSheetReceipts.push({
                                    paidDate: "",
                                    amount: "",
                                    missing: ""
                                })
                            }
                        }
                        var independantReceipts = receipts.filter(function (obj) {
                            return obj.invoiceId == "";
                        });
                        for (var j = 0; j < independantReceipts.length; j++) {
                            $scope.balanceSheetReceipts.push({
                                paidDate: independantReceipts[0].paidDate,
                                amount: independantReceipts[0].amount,
                                missing: ""
                            })
                        }
                        $scope.$apply();
                        $scope.getEmailHTML($scope.emailType);
                    }

                    $scope.newDate = function (date) {
                        if (date != "") {
                            return new Date(date);
                        } else {
                            return "";
                        }

                    }

                    $scope.getInvoiceTotalForReceipt = function (invoiceId) {
                        if (invoiceId) {
                            var invoice = $scope.data.invoice.filter(function (obj) {
                                return obj.id == invoiceId;
                            });
                            if (invoice.length) {
                                var invoiceTotal = $scope.getInvoiceTotal(invoice[0]);
                                return invoiceTotal;
                            }
                        }
                    }

                    $scope.getInvoiceAllReceiptsTotal = function (invoiceId) {
                        var receipts = $scope.data.receipt.filter(function (obj) {
                            return obj.invoiceId == invoiceId;
                        });
                        var total = 0;
                        for (var i = 0; i < receipts.length; i++) {
                            total += receipts[i].amount;
                        }
                        return total;
                    }

                    $scope.saveInvoice = function () {
                        $scope.newInvoiceFields = $scope.newInvoiceFields.filter(function (obj) {
                            return obj.lineText != "";
                        });
                        console.log("after", $scope.newInvoiceFields);
                        if ($scope.invoiceActionStatus) {
                            Invoice.add({
                                id: $scope.thisInvoiceId,
                                invoiceNumber: $scope.newInvoiceNumber,
                                bookingId: $scope.data.id,
                                propertyId: $scope.data.property.id,
                                createDate: $scope.newInvoiceCreateDate,
                                dueDate: Math.round(new Date($scope.newInvoiceDueDate) / 1000),
                                paidDate: false,
                                paymentSuggest: $scope.newInvoicepaymentSuggest,
                                managerId: $scope.admin.id,
                                invoiceLines: $scope.newInvoiceFields,
                                includeMissing: $scope.includeMissing.value
                            }).then(function (data) {
                                Notification.success({
                                    message: 'Invoice was updated.'
                                });

                                for (var i = 0; i < $scope.data.invoice.length; i++) {
                                    if ($scope.data.invoice[i].id == $scope.thisInvoiceId) {
                                        $scope.data.invoice[i] = {
                                            id: $scope.thisInvoiceId,
                                            invoiceNumber: $scope.newInvoiceNumber,
                                            bookingId: $scope.data.id,
                                            propertyId: $scope.data.property.id,
                                            createDate: $scope.newInvoiceCreateDate,
                                            dueDate: Math.round(new Date($scope.newInvoiceDueDate) / 1000),
                                            paidDate: false,
                                            paymentSuggest: $scope.newInvoicepaymentSuggest,
                                            managerId: $scope.admin.id,
                                            invoiceLines: $scope.newInvoiceFields,
                                            includeMissing: $scope.includeMissing.value
                                        }
                                    }
                                }
                                $scope.showHideInvoices = false;

                                $scope.sortInvoicesWithDD();

                                $scope.showHideInvoices = true;

                                $scope.newInvoiceFields = [{
                                    lineText: "",
                                    amountPcs: "",
                                    amountTotal: ''
                                }];
                                $scope.newInvoiceTotal = 0;
                                $scope.newInvoiceDueDate = new Date();
                                $scope.gnerateInvoiceNumber();
                                $scope.includeMissing.value = false;
                                $scope.thisInvoiceId = false;
                                $scope.newInvoiceCreateDate = new Date();
                                $scope.newInvoicepaymentSuggest = 0;
                                $scope.invoiceActionStatus = false;
                                $scope.currentReceipt = {
                                    paidDate: new Date(),
                                    amount: '',
                                    account: 0,
                                    managerId: $scope.admin.id,
                                    receiptNo: $scope.ReceiptCount + 1
                                };
                                $scope.generateNewReceiptNumber();
                                document.getElementById('invoiceForm').style.display = 'none';

                            });

                        } else {
                            Invoice.add({
                                invoiceNumber: $scope.newInvoiceNumber,
                                bookingId: $scope.data.id,
                                propertyId: $scope.data.property.id,
                                createDate: Math.round(new Date($scope.newInvoiceCreateDate) / 1000),
                                dueDate: Math.round(new Date($scope.newInvoiceDueDate) / 1000),
                                paidDate: false,
                                paymentSuggest: $scope.newInvoicepaymentSuggest,
                                managerId: $scope.admin.id,
                                invoiceLines: $scope.newInvoiceFields,
                                includeMissing: $scope.includeMissing.value
                            }).then(function (data) {
                                $scope.data.invoice.push(data);
                                Notification.success({
                                    message: 'Created a new invoice.'
                                });

                                $scope.newInvoiceFields = [{
                                    lineText: "",
                                    amountPcs: "",
                                    amountTotal: ''
                                }];
                                $scope.newInvoiceTotal = 0;
                                $scope.newInvoiceDueDate = new Date();
                                $scope.gnerateInvoiceNumber();
                                $scope.includeMissing.value = false;
                                $scope.thisInvoiceId = false;
                                $scope.newInvoiceCreateDate = new Date();
                                $scope.invoiceActionStatus = false;
                                $scope.newInvoicepaymentSuggest = 0;
                                document.getElementById('invoiceForm').style.display = 'none';
                                $scope.currentReceipt = {
                                    paidDate: new Date(),
                                    amount: '',
                                    account: 0,
                                    managerId: $scope.admin.id,
                                    receiptNo: $scope.ReceiptCount + 1
                                };
                                $scope.generateNewReceiptNumber();
                            });
                        }

                        $scope.sortInvoicesWithDD();
                    };

                    $scope.calculateNewInvoiceTotal = function () {
                        $scope.newInvoiceTotal = 0;
                        for (var i = 0; i < $scope.newInvoiceFields.length; i++) {
                            $scope.newInvoiceTotal += Number($scope.newInvoiceFields[i].amountTotal) || 0;
                        }
                    };

                    $scope.addNewInvoiceLine = function () {
                        $scope.newInvoiceFields.push({
                            lineText: "",
                            amountPcs: "",
                            amountTotal: ''
                        })
                    };
                    $scope.addNewInvoiceLine();

                    //getting current booking invoices
                    /* Invoice.list().then(function(data){
                     console.log("9999999999999", data);
                     $scope.bookingInvoices = data;
                     });*/
                    $scope.userEmail = $scope.data.user.email;

                    /*Email area*/
                    /*________________________*/


                    Email.list().then(function (emails) {
                        $scope.emails = _.sortBy(emails, function (e) {
                            return e.name;
                        }); // 2016-05-31 - Ajay - Emails sort by name
                        // $scope.languages = $rootScope.languages;
                        // console.log("LANGUAGES SCOPE", $rootScope.languages, $scope.languages);
                        $scope.searchEmail = function (value) {
                            var found = _.where($scope.data.emails, {
                                "email": value
                            });
                            if (found.length) {
                                return ' - Sent ' + $filter('timeAgo')(found[found.length - 1].date);
                            } else {
                                return '';
                            }
                        };

                        $scope.emailHtmlAddonStyle = "";

                        $scope.emailMisssingPaymentArea = function () {
                            if (($scope.calculateTotalInvoices() - $scope.calculateTotalReceipts()) != 0) {
                                return $sce.trustAsHtml($interpolate("<tr><td  style=\"padding-top:5px; border-bottom:1px solid #ddd; font-weight:bold; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color:#000; font-size:16px;\">{{T.transPaymentRemain}}</td><td style=\"text-align:right; border-bottom:1px solid #ddd; font-weight:bold; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color:#000; font-size:16px;\">{{bothPrices(calculateTotalInvoices(), data.currency.symbol, data.currencydata[data.currency.currency], 'right')}}</td></tr>")($scope));
                            }
                        }
                        $scope.paidAlreadyForEmail = function () {
                            if ($scope.calculateTotalReceipts() != 0) {
                                return $sce.trustAsHtml($interpolate("<tr><td  style=\"padding-top:5px; border-bottom:1px solid #ddd; font-weight:bold; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color:#000; font-size:16px; color:green;\">{{T.transPaidAlready}}</td><td style=\"text-align:right; border-bottom:1px solid #ddd; font-weight:bold; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color:#000; font-size:16px; color:green;\">{{bothPrices(calculateTotalReceipts(), data.currency.symbol, data.currencydata[data.currency.currency], 'right')}}</td></tr>")($scope));
                            } else {
                                return '';
                            }
                        }

                        $scope.emailReservationArea = function () {
                            if ($scope.data.priceReservation && $scope.data.priceReservation != "") {
                                return $sce.trustAsHtml($interpolate("The reservation fee is only: <b>{{data.priceReservation | currency:currency:0}}</b><br><br>You can pay with Credit Card, Bank Transfer or PayPal.<br>Please click this link and pay, so we can complete your booking.<br><a style=\"color:#000099\" href=\"{{copyLocation}}\">{{copyLocation}}</a><br>")($scope));
                            } else {
                                return "";
                            }
                        }

                        $scope.emailCheckDates = function () {
                            if ($scope.data.checkin != "" && $scope.data.checkin != 0) {
                                return $sce.trustAsHtml($interpolate($interpolate("{{T.transOfferSearchDate}}")($scope))($scope));
                            }
                        }


                        $scope.emailDiscountArea = function () {
                            if ($scope.data.discountAmount != '' && $scope.data.discountAmount != null && $scope.data.discountAmount != 0 && typeof $scope.data.discountAmount != 'undefined') {
                                return $sce.trustAsHtml($interpolate("<td style=\"padding-top:5px; border-bottom:1px solid #ddd; font-weight:normal; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color:green; font-size:14px;\">{{T.transDiscount}}</td><td style=\"text-align:right; border-bottom:1px solid #ddd; font-weight:normal; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color:green; font-size:14px;\">{{data.discountAmount | currency: currency:0}}</td>")($scope));
                            }
                        }

                        $scope.getEmailHTML = function (type) {
                            if (type != 'None') {
                                $scope.emailFieldColor = '';
                            } else {
                                $scope.emailFieldColor = "background-color:#ff9999";
                            }
                            Email.send(type, {
                                booking: $scope.data.id,
                                preview: true,
                                subject: type,
                                language: $scope.emailLanguage,
                                userID: $rootScope.admin.id
                            }).then(function (data) {
                                $scope.emailHtmlRegenerated = $interpolate(data.html)($scope);
                                $scope.emailHTML = $sce.trustAsHtml($interpolate(data.html)($scope));
                                $('#emailContentArea').html($scope.emailHTML.toString());
                                $scope.subject = data.subject;
                            });
                        };

                        $scope.selectLang = function (l) {
                            $scope.emailLanguage = l;
                        };

                        if (typeof $scope.data.user.country != 'undefined') {
                            $scope.selectLang(CountryToLanguage.getLanguageFromCountryName($scope.data.user.country));
                        }


                        $scope.tenantDetail = {};
                        $scope.getTenantDetail = function (id) {
                            User.getDetails(id).then(function (data) {
                                $scope.tenantDetail = data;
                            });
                        };

                        $scope.sendVoucher = function () {
                            $scope.voucher = !$scope.voucher;
                            $scope.getEmailHTML($scope.emailType);
                        };


                        $scope.addhttp = function (url) {
                            if (!/^(f|ht)tps?:\/\//i.test(url)) {
                                url = "http:" + url;
                            }
                            return url;
                        }


                        function emailHelper(type, preview, html, subject) {
                            html = angular.element('#emailContentArea').html()
                            document.getElementById('mailLayer').style.display = 'none';
                            Notification.success({
                                message: 'Sending email.'
                            });
                            if ($scope.voucher) {
                                $http.get(CONFIG.API_URL + '/pdf', {
                                    params: {
                                        "url": $('#printedArea').find('.container').html()
                                    }
                                }).success(function (data) {
                                    $scope.fileName.push(data.filename);
                                    $timeout(function () {
                                        Notification.success({
                                            message: 'Email sent! to ' + $scope.userEmail
                                        });
                                    }, 500);
                                    document.getElementById('mailLayer').style.display = 'none';
                                    Email.send(type, {
                                        booking: $scope.data.id,
                                        customHTML: html.toString(),
                                        preview: preview || false,
                                        //subject: $rootScope.T['email_subject_' + type],
                                        customSubject: subject,
                                        language: $scope.emailLanguage,
                                        userID: $rootScope.admin.id,
                                        userEmail: $scope.userEmail,
                                        fileName: $scope.fileName
                                    }).then(function (data) {
                                        $scope.userEmail = $scope.data.user.email;
                                        $rootScope.$broadcast("emailSent", {
                                            booking: $scope.data.id,
                                            type: type
                                        });
                                        // origModalInstance.close();
                                        if (type == 'rating') {
                                            $rootScope.$broadcast('updateStatus', {
                                                id: $scope.data.id,
                                                status: 6
                                            });
                                        }
                                        document.getElementById('mailLayer').style.display = 'none';
                                    }).catch(function (e) {
                                        Notification.error({
                                            message: e
                                        });
                                    });
                                });
                            } else {

                                if ($scope.fileName.length) {
                                    $timeout(function () {
                                        Notification.success({
                                            message: 'Email sent! to ' + $scope.userEmail
                                        });
                                    }, 500);
                                    Email.send(type, {
                                        booking: $scope.data.id,
                                        customHTML: html.toString(),
                                        preview: preview || false,
                                        customSubject: subject,
                                        language: $scope.emailLanguage,
                                        userID: $rootScope.admin.id,
                                        userEmail: $scope.userEmail,
                                        fileName: $scope.fileName
                                    }).then(function (data) {
                                        $scope.userEmail = $scope.data.user.email;
                                        $rootScope.$broadcast("emailSent", {
                                            booking: $scope.data.id,
                                            type: type
                                        });
                                        // origModalInstance.close();
                                        if (type == 'rating') {
                                            $rootScope.$broadcast('updateStatus', {
                                                id: $scope.data.id,
                                                status: 6
                                            });
                                        }

                                    }).catch(function (e) {
                                        Notification.error({
                                            message: e
                                        });
                                    });
                                } else {
                                    setTimeout(function () {
                                        Notification.success({
                                            message: 'Email sent! to ' + $scope.userEmail
                                        });
                                    }, 500);
                                    Email.send(type, {
                                        booking: $scope.data.id,
                                        customHTML: html.toString(),
                                        preview: preview || false,
                                        //subject: $rootScope.T['email_subject_' + type],
                                        customSubject: subject,
                                        language: $scope.emailLanguage,
                                        userID: $rootScope.admin.id,
                                        userEmail: $scope.userEmail
                                    }).then(function (data) {
                                        $scope.userEmail = $scope.data.user.email;
                                        $rootScope.$broadcast("emailSent", {
                                            booking: $scope.data.id,
                                            type: type
                                        });
                                        // origModalInstance.close();
                                        if (type == 'rating') {
                                            $rootScope.$broadcast('updateStatus', {
                                                id: $scope.data.id,
                                                status: 6
                                            });
                                        }
                                    }).catch(function (e) {
                                        Notification.error({
                                            message: e
                                        });
                                    });
                                }
                            }
                        };

                        $scope.balanceSheet = false;
                        $scope.balanceSheetFile = '';
                        $scope.addBalanceSheet = function () {
                            if ($scope.balanceSheet) {
                                $scope.balanceSheet = false
                                $scope.getEmailHTML($scope.emailType);
                            } else {
                                $scope.emailSendButton = false;
                                $http.post(CONFIG.API_URL + '/pdfbalance', {
                                    "html": $('#balancePdfArea').find('.container').html()
                                }).success(function (data) {
                                    $scope.emailSendButton = true;
                                    $scope.balanceSheetFile = data.filename;
                                    $scope.balanceSheet = true;
                                    $scope.getEmailHTML($scope.emailType);
                                })
                            }

                        }

                        $scope.sendEmailToManager = function (type, preview, html, subject) {
                            $scope.userEmail = $rootScope.admin.email;
                            $scope.sendEmail(type, preview, html, subject);
                        }

                        $scope.getAttachedFilesList = function () {// $$%%
                            var generatedText = '';
                            var defoult = "<br><br>" + $scope.T.transAttached + " ";
                            if ($scope.checkedInvoicesForEmail.length) {
                                generatedText += $scope.T.transInvoice.toLowerCase()
                            }
                            if ($scope.voucher) {
                                if (generatedText != "") {
                                    generatedText += ", " + $scope.T.transVoucher.toLowerCase();
                                } else {
                                    generatedText += $scope.T.transVoucher.toLowerCase();
                                }
                            }
                            if ($scope.checkedReceiptsForEmail.length) {
                                if (generatedText != "") {
                                    generatedText += ", " + $scope.T.transReceipt.toLowerCase();
                                } else {
                                    generatedText += $scope.T.transReceipt.toLowerCase();
                                }
                            }
                            if ($scope.balanceSheet) {
                                if (generatedText != "") {
                                    generatedText += ", " + $scope.T.transBalanceSheet.toLowerCase();
                                } else {
                                    generatedText += $scope.T.transBalanceSheet.toLowerCase();
                                }
                            }
                            if (generatedText != "") {
                                return $sce.trustAsHtml(defoult + generatedText + "<br>");
                            }
                        }
                        $scope.sendEmail = function (type, preview, html, subject) {
                            $scope.fileName = [];
                            for (var i = 0; i < $scope.invoiceGeneratedFileNames.length; i++) {
                                $scope.fileName.push($scope.invoiceGeneratedFileNames[i].file)
                            }
                            for (var j = 0; j < $scope.receiptGeneratedFileNames.length; j++) {
                                $scope.fileName.push($scope.receiptGeneratedFileNames[j].file)
                            }
                            if ($scope.balanceSheet) {
                                $scope.fileName.push($scope.balanceSheetFile);

                            }
                            emailHelper(type, preview, html, subject);
                        }
                    });

                    /*email area end*/


                    Property.getDetails($scope.data.property.unique).then(function (data) {
                        $scope.fullPrice = data.data.price;
                        if ($scope.data.nights < 7) {
                            $scope.agentPercent = $scope.fullPrice.commissionDay;
                            if (!$scope.data.agentCommission) {
                                $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                            }
                        } else if ($scope.data.nights < 30) {
                            $scope.agentPercent = $scope.fullPrice.commissionWeek;
                            if (!$scope.data.agentCommission) {
                                $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                            }
                        } else if ($scope.data.nights < 365) {
                            $scope.agentPercent = $scope.fullPrice.commissionMonth;
                            if (!$scope.data.agentCommission) {
                                $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                            }
                        } else {
                            $scope.agentPercent = $scope.fullPrice.commissionYear;
                            if (!$scope.data.agentCommission) {
                                $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                            }
                        }
                        Calendar.loadCalendar($scope.data.checkin, $scope.data.checkout, false, _.without(data.data.bookings, _.findWhere(data.data.bookings, {
                            id: $scope.data.id
                        })));
                    });


                    var copyBtn = document.querySelector('#copy_btn');
                    copyBtn.addEventListener('click', function () {
                        Notification.success({
                            message: 'Link has been copied.'
                        });
                        var data_id = document.querySelector('#data_id');
                        // select the contents
                        data_id.value = window.location.href.replace("management/", "");
                        data_id.select();
                        document.execCommand('copy'); // or 'cut'
                    }, false);

                    $scope.updateUser = function () {
                        User.update($scope.data.user.id, $scope.data.user);
                    };

                    $scope.countries = CountryToLanguage.getCountries();

                    $scope.statuses = Booking.getStatus(null, true);

                    $scope.sources = Booking.getSources(null, true);

                    $scope.options = {
                        calendarOpened: true
                    };


                    $scope.addExtra = function () {
                        $scope.data.priceExtra.push({
                            name: "",
                            calc: '',
                            price: ''
                        });
                    };
                    $scope.calcExtraPrice = function (index) {
                        $scope.data.priceExtra[index].price = $scope.currentExtraMultiply[index] * $scope.extraPrice[index];
                    };
                    $scope.removeExtra = function (i) {
                        $scope.data.priceExtra.splice(i, 1);
                        $scope.calcExtra();
                    };
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
                    $scope.calcExtra();

                    $scope.agentList = function () {
                        Modal.agentList();
                    };

                    $scope.tenantList = function () {
                        Modal.tenantList();
                    };

                    $scope.discountList = function () {
                        Modal.discountList();
                    };

                    $scope.statusList = function () {
                        Modal.statusList(Booking.getStatus(null, true));
                    };

                    $scope.propertyList = function () {
                        Modal.propertyList($scope.data.checkin, $scope.data.checkout);
                    };

                    $scope.removeAgent = function () {
                        $scope.data.agent = {};
                    };

                    $scope.openCalendar = function () {
                        if (!$scope.data.property.id) {
                            return Notification.error({
                                message: 'Please select a property first'
                            });
                        }
                        $scope.options.calendarOpened = true;
                        $timeout(function () {
                            $('.arrival').data('dateRangePicker').open();
                            $('.date-picker-wrapper').addClass('custom-datepicker-class');
                        });

                    };

                    $scope.emailList = function () {
                        Modal.emailList($scope.data.id, $scope.data.emails, '', $scope.data.user.id); // 2016-05-24 - Ajay - Pass user id as a parameter in email list
                    };

                    $rootScope.$on("updateStatus", function (event, data) {
                        Booking.update(data.id, {
                            status: data.status
                        }).then(function () {
                            $scope.data.status = data.status;
                            Notification.success({
                                message: 'Status updated!'
                            });
                        });
                    });

                    $scope.$watch('data.checkin', function () {
                        if (typeof $scope.fullPrice != 'undefined') {
                            console.log("FULL PRICE OBJECT : ", $scope.fullPrice);
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
                        }
                    });


                    $scope.$watch('data.nights', function () {// calculateing agent commision on date change
                        if (typeof $scope.fullPrice != 'undefined') {
                            console.log("FULL PRICE OBJECT : ", $scope.fullPrice);
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
                        }
                    });

                    $rootScope.$on("propertySelected", function (event, property) {
                        Calendar.destroy();
                        Property.getDetails(property.unique).then(function (data) {
                            var bookings = data.data.bookings;
                            Calendar.loadCalendar($scope.data.checkin, $scope.data.checkout, false, bookings);
                            $scope.fullPrice = data.data.price;
                            $timeout(function () {
                                $scope.data.property = property;
                                $scope.data.priceExtra = $scope.data.priceExtra.filter(function (obj) {
                                    return obj.name != "Final cleaning";
                                });
                                $scope.data.priceExtra.push({
                                    name: "Final cleaning",
                                    calc: "1 x " + data.data.property.cleanfinalprice,
                                    price: data.data.property.cleanfinalprice
                                });
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
                                        console.log($scope.fullPrice);
                                        if ($scope.data.nights < 7) {
                                            $scope.agentPercent = $scope.fullPrice.commissionDay;
                                            $scope.data.priceSecurity = data.priceProps.depositDay;
                                            $scope.data.priceReservation = data.priceProps.reservationDay;
                                            $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                        } else if ($scope.data.nights < 30) {
                                            $scope.agentPercent = $scope.fullPrice.commissionWeek;
                                            $scope.data.priceSecurity = data.priceProps.depositWeek;
                                            $scope.data.priceReservation = data.priceProps.reservationWeek;
                                            $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                        } else if ($scope.data.nights < 365) {
                                            $scope.data.priceSecurity = data.priceProps.depositWeek;
                                            $scope.data.priceReservation = data.priceProps.reservationWeek;
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

                    $rootScope.$on("agentSelected", function (event, agent) {
                        $scope.data.agent = agent;
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

                    $rootScope.$on("tenantSelected", function (event, tenant) {
                        $scope.data.user = tenant;
                    });

                    $rootScope.$on("discountSelected", function (event, discount) {
                        console.log('discount', $scope.discountPrice);
                        $scope.discountPrice = Math.round($scope.data.nights * $scope.data.priceDay / 100 * ($scope.data.discount.percent || 0));
                        console.log("watcher discount 1", $scope.discountPrice);
                    });

                    $rootScope.$on("statusSelected", function (event, status) {
                        $scope.data.status = status.value;
                    });

                    $rootScope.$on("datesChanged", function (event, dates) {
                        if ($('.date-picker-wrapper').is(':visible')) {
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
                                        if ($scope.data.agentCommission == 0 && typeof $scope.data.agentCommission == 'undefined') {
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
                                            console.log($scope.data.agentCommission);
                                            $scope.$apply();
                                        }
                                    });
                                }
                            });
                        }

                    });

                    $scope.getStatus = function (s) {
                        return Booking.getStatus(s);
                    };

                    $scope.delete = function (id) {
                        Booking.delete(id).then(function () {
                            Notification.success({
                                message: 'Booking Deleted !'
                            });
                            $state.go('management.home', {}, {
                                reload: true
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

                    $scope.cancelBooking = function () {
                        $scope.saveAction = true;
                        window.history.back();
                    };

                    $scope.update = function () {
                        $scope.saveAction = true;
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
                        };

                        if ($scope.data.priceSecurity == null) {
                            $scope.data.priceSecurity = 0;
                        }

                        if ($scope.data.priceReservation == null) {
                            $scope.data.priceReservation = 0;
                        }

                        var checkinTime = moment($scope.data.checkin).utc();
                        var nowInMoment = moment().utc();


                        if (checkinTime.diff(nowInMoment, 'days') == 0) {
                            $scope.data.expires = moment().utc().unix();
                        } else if (checkinTime.diff(nowInMoment, 'days') <= 6) {
                            $scope.data.expires = moment().utc().add(1, 'day').unix();
                        } else if (checkinTime.diff(nowInMoment, 'days') > 6 && checkinTime.diff(nowInMoment, 'days') < 30) {
                            $scope.data.expires = moment().utc().add(5, 'day').unix();
                        } else if (checkinTime.diff(nowInMoment, 'days') >= 30) {
                            $scope.data.expires = moment().utc().add(10, 'day').unix();
                        }


                        var booking = {
                            "property": $scope.data.property.id,
                            "user": $scope.data.user.id,
                            "agent": $scope.data.agent.id ? $scope.data.agent.id : '',
                            "agentCommission": $scope.data.agentCommission,
                            "discount": $scope.data.discount.id,
                            "discountPercentage": $scope.data.discount.percent,
                            "discountAmount": $scope.discountPrice,
                            "checkin": $scope.data.checkin ? moment.utc($scope.data.checkin, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix() : '',
                            "checkout": $scope.data.checkout ? moment.utc($scope.data.checkout, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix() : '',
                            "status": $scope.data.status,
                            "currency": $scope.data.currency,
                            "priceExtra": $scope.getFilledExtra(),
                            "paymentType": $scope.data.paymentType,
                            "priceDay": $scope.data.priceDay,
                            "created": moment.utc().unix(),
                            "utilitiesElectricity": $scope.data.utilitiesElectricity,
                            "utilitiesWater": $scope.data.utilitiesWater,
                            "utilitiesWifi": $scope.data.utilitiesWifi,
                            "utilitiesCable": $scope.data.utilitiesCable,
                            "rate": 1,
                            "expires": $scope.data.expires,
                            "nights": $scope.data.nights,
                            "conditionsAgent": $scope.data.conditionsAgent,
                            "conditionsTenant": $scope.data.conditionsTenant,
                            "pricePaid": $scope.data.pricePaid,
                            "priceReservation": $scope.data.priceReservation,
                            "priceSecurity": $scope.data.priceSecurity,
                            "emails": $scope.data.emails,
                            "rentpayday": $scope.data.rentpayday,
                            "nextpayment": nextpaymentDate,
                            "comment": $scope.data.comment,
                            "source": $scope.data.source,
                            "arrival": $scope.data.arrival,
                            "electricPrice": $scope.data.property.electricUnit * ($scope.data.electricTo - $scope.data.electricFrom),
                            "electricFrom": $scope.data.electricFrom,
                            "waterFrom": $scope.data.waterFrom,
                            "waterTo": $scope.data.waterTo,
                            "waterPrice": $scope.data.property.waterUnit * ($scope.data.waterTo - $scope.data.waterFrom),
                            "electricTo": $scope.data.electricTo,
                            "departure": $scope.data.departure,
                            "longTermDay": $scope.longTheremPayDay.value,
                            "longTermAmount": $scope.longTheremPayPrice.value
                        };

                        Booking.update($scope.data.id, booking).then(function () {
                            Notification.success({
                                message: 'Booking Updated !'
                            });

                            var userCountry = CountryToLanguage.getCountryByName($scope.data.user.country).code;


                            $http.post(CONFIG.HELPER_URL + '/booking/updateBooking/', {
                                checkin: moment($scope.data.checkin).format('YYYY-MM-DD'),
                                checkout: moment($scope.data.checkout).subtract(1, 'days').format('YYYY-MM-DD'),
                                user: $scope.data.user.name,
                                userEmail: $scope.data.user.email,
                                userPhone: $scope.data.user.phone,
                                userCountry: $scope.data.user.country,
                                totalPrice: $scope.valueForRentPrice(),
                                deposit: $scope.data.priceSecurity,
                                th_id: $scope.data.id,
                                prop: $scope.data.property.unique,
                                status: $scope.data.status,
                                arrival: $scope.data.arrival
                            }).success(function (data) {
                                console.log("DATA FROM BEDS24 about this booking :", data);
                            });

                            Modal.bookingUpdateModal($scope.data.id);

                            // $state.go('management.home', {}, {
                            //   reload: true
                            // });

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

                    if ($stateParams.check) {
                        Booking.update($scope.data.id, {
                            checked: true
                        });
                    }

                }]);
})();
