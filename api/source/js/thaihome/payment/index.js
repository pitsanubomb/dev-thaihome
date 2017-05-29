(function () {
    'use strict';
    angular.module('ThaiHome')
        .factory('Payment', [function () {
            return {
                methods: function () {
                    return [
                        {
                            id: 0,
                            name: 'Bank Transfer',
                            directive: 'bank',
                            cc: false
                        }, {
                            id: 1,
                            name: 'CreditCard',
                            directive: 'siampay',
                            cc: true
                        }, {   // 2016-06-06 - Ajay - Add new payment method for agent
                            id: 2,
                            name: 'Paid to Agent',
                            directive: 'paid_to_agent',
                            cc: false
                        }, {
                            id: 3,
                            name: 'PayPal',
                            directive: 'paypal',
                            cc: false
                        }, {   // 2016-06-06 - Ajay - Add new payment method for agent
                            id: 4,
                            name: 'Cash',
                            directive: 'cash',
                            cc: false
                        }, {   // 2016-06-06 - Ajay - Add new payment method for agent . added by Tiko "Ajay du mi ayl tipi debil es"
                            id: 5,
                            name: 'Cash on arrival',
                            directive: 'cash_on_arrival',
                            cc: false
                        }
                    ];
                },
                storefrontPayments: function () {
                   return [
                        {
                            id: 0,
                            name: 'Bank Transfer',
                            directive: 'bank',
                            cc: false
                        }, {
                        id: 1,
                        name: 'CreditCard',
                        directive: 'siampay',
                        cc: true
                    }, {
                        id: 3,
                        name: 'PayPal',
                        directive: 'paypal',
                        cc: false
                    }
                    ];

                }
            };
        }])
        .directive('paymentBank', ['$templateCache', function ($templateCache) {
            return {
                restrict: 'AE',
                template: function () {
                    return $templateCache.get('templates/payment/bank/index.html');
                }
            };
        }]).directive('paymentPaypal', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'AE',
            template: function () {
                return $templateCache.get('templates/payment/paypal/index.html');
            }
        };
    }])

        .directive('paymentStepOne', ['$templateCache', function ($templateCache) {
            return {
                restrict: 'AE',
                template: function () {
                    return $templateCache.get('templates/payment/steps/first.html');
                }
            };
        }])
        .directive('paymentStepTwo', ['$templateCache', function ($templateCache) {
            return {
                restrict: 'AE',
                template: function () {
                    return $templateCache.get('templates/payment/steps/final.html');
                }
            };
        }])
        .filter('numberFixedLen', function () {
            return function (n, len) {
                var num = parseInt(n, 10);
                len = parseInt(len, 10);
                if (isNaN(num) || isNaN(len)) {
                    return n;
                }
                num = '' + num;
                while (num.length < len) {
                    num = '0' + num;
                }
                return num;
            };
        })
        .controller('SiamPayCtrl', ['$scope', '$state', '$sce', function ($scope, $state, $sce) {
            $scope.DATA = {
                URL: $sce.trustAsResourceUrl('https://test.siampay.com/b2cDemo/eng/payment/payForm.jsp'),
                MERCHANT_ID: {
                    USD: 76062645,
                    EUR: 76062672,
                    THB: 76062633
                },
                PAYMENT_TYPE: 'N',
                PAYMENT_METHOD: 'ALL',
                MPS_MODE: 'NIL'
            };

            $scope.currencyCodes = [
                {
                    name: "USD",
                    code: "840"
                },
                {
                    name: "EUR",
                    code: "978"
                },
                {
                    name: "THB",
                    code: "764"
                },
            ];

            $scope.languageCodes = [
                {
                    name: "en",
                    code: "E"
                },
                {
                    name: "th",
                    code: "T"
                }
            ];

            var year = new Date().getFullYear();
            var range = [];
            range.push(year);
            for (var i = 1; i < 20; i++) {
                range.push(year + i);
            }
            $scope.years = range;
        }])
        .directive('paymentSiampay', ['$templateCache', '$state', 'CONFIG', function ($templateCache, $state, CONFIG) {
            return {
                controller: 'SiamPayCtrl',
                restrict: 'AE',
                link: function (scope, element, attrs) {
                },
                template: function () {
                    return $templateCache.get('templates/payment/siampay/index.html');
                }
            };
        }])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('payment', {
                    url: '/payment/',
                    template: '<ui-view></ui-view>'
                })
                .state('payment.success', {
                    url: 'success/:id/',
                    css: '/css/style.css',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/payment/siampay/success.html');
                    },
                    controller: ['$state', '$stateParams', '$scope', function ($state, $stateParams, $scope) {
                        /** Ajay - Remove local booking id after payment success */
                        localStorage.removeItem('past-booking-id');

                        $scope.bookingURL = $state.href('booking', {
                            id: $stateParams.id
                        }, {
                            absolute: true
                        });
                    }],
                    resolve: {
                        doPayment: ['$stateParams', '$state', 'Booking', '$q', '$rootScope', 'Email', 'Locale', function ($stateParams, $state, Booking, $q, $rootScope, Email, Locale) {
                            var d = $q.defer();
                            Booking.getDetails($stateParams.id).then(function (data) {

                                var priceExtra = 0;
                                _.map(data.data.priceExtra, function (price) {
                                    priceExtra.priceExtra += parseInt(price.price);
                                });
                                var AMOUNT = 0;
                                if (data.data.priceReservation) {
                                    AMOUNT = data.data.priceReservation;
                                } else {
                                    AMOUNT = data.data.cleanfinalprice + (data.data.priceDay * data.data.nights - (data.data.priceDay * data.data.nights / 100 * data.data.discountPercentage)) + priceExtra;
                                }
                                var timestamp = moment().utc().unix();
                                var update = {
                                    updated: timestamp,
                                    paymentDate: timestamp,
                                    pricePaid: AMOUNT,
                                    status: 3,
                                    paymentType: 1
                                };

                                Booking.update(data.data.id, update).then(function (data) {
                                    d.resolve(data);
                                });
                                /**
                                 Ajay : Check for Translation, and send out pending email to user.
                                 */
                                $rootScope.$watch('T', function () {
                                    if ($rootScope.T) {
                                        Email.send('payment_pending', {
                                            booking: data.data.id,
                                            preview: false,
                                            subject: ($rootScope.T && $rootScope.T.email_subject_payment_pending) ? $rootScope.T.email_subject_payment_pending : 'Payment Pending',
                                            language: $rootScope.language
                                        });
                                    }
                                })

                            }).catch(function () {
                                d.reject();
                            });
                            return d.promise;
                        }]
                    }
                })
                .state('payment.fail', {
                    url: 'fail/:id/?errorMsg',
                    css: '/css/style.css',
                    controller: ['$scope', '$stateParams', '$state', function ($scope, $stateParams, $state) {
                        $scope.error = $stateParams.errorMsg;

                        $scope.bookingURL = $state.href('booking', {
                            id: $stateParams.id
                        }, {
                            absolute: true
                        });
                    }],
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/payment/siampay/fail.html');
                    },
                    resolve: {}
                });
        }]);
})();
