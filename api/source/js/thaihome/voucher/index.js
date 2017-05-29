if (location.pathname.indexOf('/voucher-print') != -1) {
    $(".page-loading").addClass("hide");
}
(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('voucher', {
                    url: '/voucher/:id/',
                    title: 'title_voucher',
                    css: '/css/style.css',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/thaihome/voucher/index.html');
                    },
                    controller: 'VoucherCtrl',
                    resolve: {
                        BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
                            var deferred = $q.defer();
                            Booking.getDetails($stateParams.id).then(function (data) {
                                deferred.resolve(data);
                            }).catch(function (err) {
                                deferred.reject(err, 404);
                            });
                            return deferred.promise;
                        }]
                    }
                }).state('voucher-print', {
                url: '/voucher-print/:id/',
                title: 'title_voucher_print',
                css: '/css/style.css',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/thaihome/voucher/voucher-print.html');
                },
                controller: 'VoucherCtrl',
                resolve: {
                    BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
                        var deferred = $q.defer();
                        Booking.getDetails($stateParams.id).then(function (data) {
                            deferred.resolve(data);
                        }).catch(function (err) {
                            deferred.reject(err, 404);
                        });
                        return deferred.promise;
                    }]
                }
            });
        }])
        .controller('VoucherCtrl', ['BookingData', 'Payment', 'Contact', 'Modal', 'gMaps', '$scope', '$http', 'CONFIG', '$timeout', function (BookingData, Payment, Contact, Modal, gMaps, $scope, $http, CONFIG, $timeout) {
            $(".page-loading").addClass("hide");
            $scope.data = BookingData.data;
            $scope.priceExtra = 0;
            $scope.locationThis = window.location.href.replace(window.location.pathname, '') + "/";
            $scope.translation = BookingData.data.translation;
            _.each($scope.data.priceExtra, function (price) {
                $scope.priceExtra += parseInt(price.price);
            });
            $scope.getDateNormalFormat = function (date) {
                return moment(date).format('DD MMMM YYYY');
            };

            $scope.rules = function () {
                Modal.rules($scope.translation);
            };

            $scope.cancellation = function () {
                Modal.cancellation();
            };

            // 2016-05-26 - Ajay - function for download pdf

            $scope.getAlreadyPayed = function () {
                var payedAmount = 0;
                for (var j = 0; j < $scope.data.receipt.length; j++) {
                    payedAmount += $scope.data.receipt[j].amount;
                }
                return payedAmount;
            };
            $scope.getInvoiceTotal = function (invoice) {
                var total = 0;
                for (var i = 0; i < invoice.invoiceLines.length; i++) {
                    total += invoice.invoiceLines[i].amountTotal;
                }
                return total;
            };

            $scope.calculateTotalInvoices = function () {
                var totalPrice = 0;
                for (var i = 0; i < $scope.data.invoice.length; i++) {
                    totalPrice += Number($scope.getInvoiceTotal($scope.data.invoice[i]));
                }
                return totalPrice;
            };
            $scope.calculateTotalReceipts = function () {
                var totalPrice = 0;
                for (var i = 0; i < $scope.data.receipt.length; i++) {
                    totalPrice += $scope.data.receipt[i].amount;
                }
                return totalPrice;
            };

            $scope.payForArrive = function () {
                var payForArrive = $scope.calculateTotalInvoices() - $scope.calculateTotalReceipts()
                if (payForArrive != 0) {
                    return payForArrive;
                } else {
                    return $scope.data.cleanfinalprice + ($scope.data.priceDay * $scope.data.nights - ($scope.data.priceDay * $scope.data.nights / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                }
            };

            $scope.downloadAsPdf = function (id) {
                // $(".page-loading").removeClass("hide");
                $http.get(CONFIG.API_URL + '/pdf', {
                    params: {
                        "url": $('#printedArea').find('.container').html()
                    }
                }).success(function (data) {
                    var btnhtml = "<a id='download' href='" + CONFIG.API_URL + '/assets/voucherPDF/' + data.filename + "' download='Voucher.pdf' target='_blank'></a>";
                    var newButt = angular.element(btnhtml);
                    angular.element('#downloadAsPdf').after(newButt);
                    $timeout(function () {
                        angular.element('#download')[0].click();
                        angular.element('#download').remove();
                        $timeout(function () {
                            $http.post(CONFIG.API_URL + '/pdf', {filename: data.filename}).success(function (data) {
                            });
                        }, 1000);
                    });
                    $(".page-loading").addClass("hide");
                });
            };

            $scope.addhttp = function (url) {
                if (!/^(f|ht)tps?:\/\//i.test(url)) {
                    url = "http:" + url;
                }
                return url;
            }

            // 2016-05-26 - Ajay - function for Print Voucher
            $scope.print = function () {
                window.print();
            };
        }]);

})();
