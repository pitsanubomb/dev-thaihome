(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('management.expenses', {
                    url: 'expenses/',
                    controller: 'ManagerExpensesCtrl',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/management/expenses/index.html');
                    }
                });
        }])
        .run(['$rootScope', '$templateCache', function ($rootScope, $templateCache) {
            $rootScope.$on('$routeChangeStart', function () {
                $templateCache.removeAll();
            });
        }])
        .controller('ManagerExpensesCtrl', ['$scope', '$rootScope', 'Expenses', 'Property', 'bankAccounts', 'Booking',
            function ($scope, $rootScope, Expenses, Property, bankAccounts, Booking) {
                // get all properties

                $scope.expenses = [];

                $scope.prop = [];
                $scope.actionStatus = false;

                $scope.calcDays = function (a, b) {
                    if (!b) b = moment().utc().unix();
                    return moment.utc(a, 'X').diff(moment.utc(b, 'X'), 'days');
                };

                Expenses.getAll().then(function (data) {
                    $scope.expenses = data;
                });
                Property.getAll().then(function (data) {
                    $scope.properties = data;
                    console.log(data);
                });

                $scope.calculateMultiplePropRices = function () {
                    var salePrices = [];
                    var propExpPrices = [];
                    var priceMath = 0;
                    for (var i = 0; i < $scope.prop.length; i++) {
                        var current = $scope.properties.filter(function (obj) {
                            return obj.unique == $scope.prop[i];
                        });
                        if (current.length) {
                            salePrices.push(current[0].saleprice);
                            priceMath += current[0].saleprice;
                        }
                    }
                    console.log("salePrices", salePrices);
                    console.log("priceMath", priceMath);
                    var finalSalePrices = 0;
                    for (var j = 0; j < salePrices.length; j++) {
                        finalSalePrices += Math.round((salePrices[j] * 100 / priceMath ) * $scope.expenseAmount / 100);
                        propExpPrices.push(Math.round((salePrices[j] * 100 / priceMath ) * $scope.expenseAmount / 100));
                    }
                    propExpPrices[propExpPrices.length - 1] += ($scope.expenseAmount - finalSalePrices);
                    console.log("propExpPrices", propExpPrices);
                    console.log("finalSalePrices", finalSalePrices);
                    return propExpPrices;

                };

                $scope.payStatus = ["PAID", "NOT PAID"];

                // list of expense categories
                $scope.categories = [
                    {
                        category: "Item",
                        value: 1
                    },
                    {
                        category: "Office",
                        value: 2
                    },
                    {
                        category: "Insurance",
                        value: 3
                    }
                ];

                // list of accounts
                $scope.accounts = bankAccounts.get();

                $scope.getPaidColor = function (value) {
                    if (value == "NOT PAID") {
                        return "startGreenTxt";
                    } else {
                        return "startRedTxt";
                    }
                };


                $scope.dueDate = new Date();
                $scope.fromDate = new Date();
                $scope.toDate = new Date();

                $scope.editExpense = function (id) {
                    document.getElementById('propSelect').removeAttribute('multiple');
                    var current = $scope.expenses.filter(function (obj) {
                        return obj.id == id;
                    });
                    console.log("current", current);
                    $scope.expId = id;
                    $scope.expenseCategories = current[0].expenseCategory;
                    $scope.dueDate = new Date(Number(current[0].dueDate) * 1000);
                    $scope.fromDate = new Date(Number(current[0].fromDate) * 1000);
                    $scope.toDate = new Date(Number(current[0].toDate) * 1000);
                    if (current[0].paidDate != "NOT PAID") {
                        $scope.expensePay = "PAID";
                    } else {
                        $scope.expensePay = "NOT PAID";
                    }
                    $scope.prop = [];
                    $scope.prop.push(current[0].propertyId);
                    $scope.expenseText = current[0].text;
                    $scope.expenseAmount = current[0].amount;
                    $scope.expenseAccount = current[0].account;
                    $scope.bookId = current[0].bookId;
                    $scope.actionStatus = true;
                    $scope.transactionNo = current[0].transactionNo;
                    document.getElementById('listExpense').style.display = 'none';
                    document.getElementById('formExpense').style.display = 'inline';
                };

                $scope.$watch('prop', function () {
                    if ($scope.actionStatus == true && $scope.prop.length == 0) {
                        $scope.prop.push(angular.element('#propSelect').val().replace(/string:/g, ''));
                    }
                });

                $scope.deleteExpense = function (id) {
                    Expenses.delete(id).then(function (data) {
                        $scope.expenses = $scope.expenses.filter(function (obj) {
                            return obj.id != id;
                        });
                        $scope.cleanBuffer();
                        document.getElementById('listExpense').style.display = 'inline';
                        document.getElementById('formExpense').style.display = 'none';
                    });
                };
                $scope.getNewDate = new Date();
                $scope.isMultiple = "multiple";

                $scope.getDateColor = function (expense) {
                    if (expense.paidDate == 'NOT PAID') {
                        if ($scope.calcDays(expense.dueDate) < 1) {
                            return "startRedTxt";
                            // $scope.calcDays((expense.dueDate) < 1 ? 'startRedTxt' : 'startGreenTxt')
                        } else {
                            return "startGreenTxt";
                        }
                    }
                };


                $scope.saveExp = function () {
                    if($scope.prop.length === 0){
                        $scope.prop[0] = '';
                    }
                    if ($scope.prop.length === 1 || typeof $scope.prop == 'undefined') {
                        if ($scope.expensePay == "PAID") {
                            $scope.expensePay = Math.round(new Date() / 1000);
                        }
                        $scope.dueDate = Math.round(new Date($scope.dueDate) / 1000);
                        $scope.fromDate = Math.round(new Date($scope.fromDate) / 1000);
                        $scope.toDate = Math.round(new Date($scope.toDate) / 1000);
                        if ($scope.actionStatus === false) {
                            document.getElementById('propSelect').setAttribute('multiple', '');
                            $scope.isMultiple = "multiple";
                            Expenses.add({
                                "expenseCategory": $scope.expenseCategories,
                                "dueDate": $scope.dueDate,
                                "fromDate": $scope.fromDate,
                                "toDate": $scope.toDate,
                                "paidDate": $scope.expensePay,
                                "propertyId": $scope.prop[0],
                                "text": $scope.expenseText,
                                "amount": $scope.expenseAmount,
                                "account": $scope.expenseAccount,
                                "bookId": $scope.bookId,
                                "transactionNo": 0,
                                "managerId": $rootScope.admin.id
                            }).then(function (data) {
                                $scope.cleanBuffer();
                                $scope.expenses.push(data);
                                console.log(data);
                            });
                        }
                        else {
                            Expenses.update({
                                "id": $scope.expId,
                                "expenseCategory": $scope.expenseCategories,
                                "dueDate": $scope.dueDate,
                                "fromDate": $scope.fromDate,
                                "toDate": $scope.toDate,
                                "paidDate": $scope.expensePay,
                                "propertyId": $scope.prop[0],
                                "text": $scope.expenseText,
                                "amount": $scope.expenseAmount,
                                "account": $scope.expenseAccount,
                                "bookId": $scope.bookId,
                                "transactionNo": $scope.transactionNo,
                                "managerId": $rootScope.admin.id
                            }).then(function (data) {
                                $scope.cleanBuffer();
                                for (var i = 0; i < $scope.expenses.length; i++) {
                                    if ($scope.expenses[i].id == data.id) {
                                        $scope.expenses[i] = data;
                                        console.log("filtered", $scope.expenses[i]);
                                    }
                                }
                                console.log(data);
                            });
                        }
                    } else {
                        var pricesForEach = $scope.calculateMultiplePropRices();
                        var addMultiple = function (i) {
                            Expenses.add({
                                "expenseCategory": $scope.expenseCategories,
                                "dueDate": Math.round(new Date($scope.dueDate) / 1000),
                                "fromDate": Math.round(new Date($scope.fromDate) / 1000),
                                "toDate": Math.round(new Date($scope.toDate) / 1000),
                                "paidDate": $scope.expensePay,
                                "propertyId": $scope.prop[i],
                                "text": $scope.expenseText,
                                "amount": pricesForEach[i],
                                "account": $scope.expenseAccount,
                                "bookId": $scope.bookId,
                                "transactionNo": 0,
                                "managerId": $rootScope.admin.id
                            }).then(function (data) {
                                $scope.expenses.push(data);
                                console.log(data);
                                if (i + 1 < pricesForEach.length) {
                                    i++;
                                    addMultiple(i);
                                } else {
                                    $scope.cleanBuffer();
                                }
                            });
                        };
                        addMultiple(0);
                        console.log($scope.calculateMultiplePropRices());
                    }
                };
                $scope.cleanBuffer = function () {
                    $scope.expId = "";
                    $scope.expenseCategories = "";
                    $scope.dueDate = new Date();
                    $scope.fromDate = new Date();
                    $scope.toDate = new Date();
                    $scope.prop = [];
                    $scope.expenseText = "";
                    $scope.expenseAmount = "";
                    $scope.expenseAccount = "";
                    $scope.bookId = "";
                    $scope.expensePay = "";
                };
                $scope.payExpChange = function (id) {
                    var current = $scope.expenses.filter(function (obj) {
                        return obj.id == id;
                    });
                    console.log("current", current);
                    $scope.expId = id;
                    $scope.expenseCategories = current[0].expenseCategory;
                    //$scope.dueDate = new Date(current[0].dueDate);
                    //$scope.fromDate = new Date(current[0].fromDate);
                    //$scope.toDate = new Date(current[0].toDate);
                    $scope.prop = [];
                    $scope.prop.push(current[0].propertyId);
                    $scope.expenseText = current[0].text;
                    $scope.expenseAmount = current[0].amount;
                    $scope.expenseAccount = current[0].account;
                    $scope.bookId = current[0].bookId;
                    $scope.actionStatus = true;
                    $scope.transactionNo = current[0].transactionNo;
                    $scope.expensePay = "PAID";
                    $scope.saveExp();
                }
            }]);
})();
