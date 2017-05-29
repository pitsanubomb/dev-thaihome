(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('management', {
                    url: '/management/',
                    css: ['/css/admin.css'],
                    template: '<ui-view></ui-view>',
                    controller: ["$state", function ($state) {
                        if ($state.current.name === 'management') {
                            return $state.go('management.home');
                        }
                    }],
                    resolve: {
                        Admin: ['Auth', '$q', '$state', '$rootScope', function (Auth, $q, $state, $rootScope) {
                            var d = $q.defer();
                            Auth.checkLogged().then(function (data) {

                                if (data.data.type === 'admin') {
                                    $rootScope.admin = data.data;
                                    d.resolve(data);
                                } else {
                                    $state.go('admin_login', {
                                        "to": "management"
                                    });
                                    d.reject();
                                }
                            }).catch(function () {
                                $state.go('admin_login', {
                                    "to": "management"
                                });
                                d.reject();
                            });

                            return d.promise;
                        }],
                        Bookings: ['Booking', '$q', '$rootScope', '$stateParams', function (Booking, $q, $rootScope, $stateParams) {
                            var d = $q.defer();
                            Booking.findManagement({
                                status: parseInt($stateParams.bookingType)
                            }).then(function (data) {
                                $rootScope.menu_bookings = 0;
                                _.each(data.data.data, function (v) {
                                    $rootScope.menu_bookings = $rootScope.menu_bookings + v.length;
                                });
                                d.resolve(data.data);
                            }).catch(function () {
                                $rootScope.menu_bookings = 0;
                                d.resolve([]);
                            });

                            return d.promise;

                        }],
                        Messages: ['Contact', '$q', '$rootScope', function (Contact, $q, $rootScope) {
                            var d = $q.defer();
                            Contact.getUnreadCount().then(function (data) {
                                $rootScope.menu_messages = data;
                                d.resolve();
                            }).catch(function () {
                                $rootScope.menu_messages = 0;
                                d.resolve([]);
                            });
                            return d.promise;
                        }]
                    }
                })
                .state('management.home', {
                    url: 'home/',
                    controller: 'ManagementHomeCtrl',
                    title: 'title_agent_home',
                    css: ['/css/admin.css'],
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/management/home/index.html');
                    }
                });
        }])
        .controller('ManagementHomeCtrl', ['Bookings', 'Notification', '$state', 'Booking', '$stateParams', '$scope', '$rootScope', 'DTOptionsBuilder', 'Modal', 'Todo', 'Property', '$http', 'Chacklistcategory', 'Expenses', 'bankAccounts', 'CONFIG', 'Email', 'CountryToLanguage', '$sce', '$interpolate',
            function (Bookings, Notification, $state, Booking, $stateParams, $scope, $rootScope, DTOptionsBuilder, Modal, Todo, Property, $http, Chacklistcategory, Expenses, bankAccounts, CONFIG, Email, CountryToLanguage, $sce, $interpolate) {
                $scope.dtOptions = DTOptionsBuilder.newOptions();
                $http.get(CONFIG.HELPER_URL + "/booking/getCheckinCheckount").then(function(res){
                    console.log(' CHECKIN CHECKOUT BOOKINGS DATA : ');
                    $scope.checkinToday = res.data.bookings.checkinToday;
                    $scope.checkinTomorrow = res.data.bookings.checkinTomorrow;
                    $scope.checkoutToday = res.data.bookings.checkoutToday;
                    $scope.checkoutTomorrow = res.data.bookings.checkoutTomorrow;
                });
                $scope.bookings = Bookings.data;
                $scope.users = Bookings.users;
                $scope.properties = Bookings.properties;
                $scope.prices = Bookings.prices;
                $scope.today = moment().utc().format('x');
                $scope.tomorrow = moment().add(1, 'day').utc().format('x');

                localStorage.setItem('locale', 'gb');
                localStorage.setItem('currency', 'THB');


                $scope.getStatus = function (status) {
                    return Booking.getStatus(status);
                };

                $scope.statuses = Booking.getStatus(false, true);

                $scope.calcDays = function (a, b) {
                    if (!b) b = moment().utc().unix();
                    return moment.utc(a, 'X').diff(moment.utc(b, 'X'), 'days');
                };

                $scope.newBookingCalc = function (booking) {
                    var conf = _.findWhere(booking.emails, {
                        email: "booking_confirmation"
                    });
                    var rem = _.findWhere(booking.emails, {
                        email: "booking_reminder"
                    });

                    if (rem) {
                        return $scope.calcDays(rem.date);
                    } else if (conf) {
                        return $scope.calcDays(conf.date);
                    } else {
                        return $scope.calcDays(booking.created);
                    }
                };

                $scope.newBookingButton = function (booking) {
                    var conf = _.findWhere(booking.emails, {
                        email: "booking_confirmation"
                    });
                    var rem = _.findWhere(booking.emails, {
                        email: "booking_reminder"
                    });

                    if (!booking.checked) {
                        return 'check';
                    } else if (rem) {
                        return 'cancel';
                    } else if (!conf) {
                        return 'send';
                    } else {
                        return 'remind';
                    }
                };

                $scope.pendingBookingCalc = function (booking) {
                    var conf = _.findWhere(booking.emails, {
                        email: "booking_confirmation"
                    });
                    var rem = _.findWhere(booking.emails, {
                        email: "booking_reminder"
                    });
                    if (rem) {
                        return $scope.calcDays(rem.date);
                    } else if (conf) {
                        return $scope.calcDays(conf.date);
                    } else {
                        return $scope.calcDays(booking.created);
                    }
                };

                $scope.recurringBookingButton = function (booking) {
                    var days = $scope.calcDays(moment.utc().unix(), booking.nextpayment);
                    var dates = [];
                    var invoice = true;
                    _.each(booking.emails, function (email) {
                        if (email.email === 'long_term_invoice') {
                            dates.push(email.date);
                        }
                    });

                    dates = dates.sort();

                    var last = dates[dates.length - 1] || moment().utc().unix();
                    if ($scope.calcDays(moment(last, 'X').utc().unix()) > 15) {
                        invoice = false;
                    }

                    if (moment.utc().unix() > booking.nextpayment && days < 15) {
                        return 'late';
                    } else if (moment.utc().unix() > booking.nextpayment && days >= 15) {
                        return 'evict';
                    } else if (!invoice || !dates.length) {
                        return 'invoice';
                    }

                };

                $scope.getInvoiceTotal = function (invoice) {
                    var total = 0;
                    for (var i = 0; i < invoice.invoiceLines.length; i++) {
                        total += invoice.invoiceLines[i].amountTotal;
                    }
                    return total;
                };

                $scope.pendingBookingButton = function (booking) {
                    var rem = _.findWhere(booking.emails, {
                        email: "booking_reminder"
                    });

                    if (booking.paymentconfirmed) {
                        return 'paid';
                    } else if (rem) {
                        return 'cancel';
                    } else {
                        return 'remind';
                    }
                };

                $scope.cancel = function (booking, key) {
                    Booking.update(booking.id, {
                        status: 7
                    }).then(function () {
                        _.each($scope.bookings, function (value, key) {
                            $scope.bookings[key] = _.without($scope.bookings[key], booking);
                        });
                    });
                };

                $scope.check = function (booking) {
                    $state.go('management.booking', {
                        id: booking.id,
                        check: true
                    });

                    _.each($scope.bookings.new, function (b) {
                        if (booking.id === b.id) {
                            booking.checked = true;
                        }
                    });
                };

                $scope.remind = function (booking, type) {
                    Modal.emailList(booking.id, booking.emails, type, booking.user); // 2016-05-23 - Ajay - Pass Booking user as a parameter in email list
                };

                $scope.paid = function (booking) {
                    Booking.update(booking.id, {
                        paymentconfirmed: true,
                        status: 4
                    });
                    _.map($scope.bookings, function (bookings, key) {
                        var found = _.findWhere(bookings, {
                            id: booking.id
                        });
                        if (found) {
                            $scope.bookings[key] = _.without($scope.bookings[key], found);
                        }
                    });
                };

                $scope.sum = function (booking) {
                    var PriceExtra = 0;
                    _.each(booking.priceExtra, function (extra) {
                        PriceExtra = parseFloat(PriceExtra) + parseFloat(extra.price);
                    });

                    var FinalPrice = booking.nights * booking.priceDay - (booking.nights * booking.priceDay / 100 * parseInt(booking.discountPercentage)) + parseFloat(PriceExtra) + booking.cleanfinalprice;
                    FinalPrice = (FinalPrice * booking.rate).toFixed(0);
                    return FinalPrice;
                };

                $rootScope.$on("emailSent", function (event, data) {
                    var booking = data.booking;
                    _.map($scope.bookings, function (bookings, key) {
                        var found = _.findWhere(bookings, {
                            id: booking
                        });
                        if (found) {
                            if (data.type === 'rating' && key === 'checkout') {
                                Booking.update(found.id, {
                                    status: 5
                                });
                                $scope.bookings[key] = _.without($scope.bookings[key], found);
                            } else if (data.type === 'checkin_reminder' && key === 'arrival') {
                                $scope.bookings[key] = _.without($scope.bookings[key], found);
                            } else if (data.type === 'long_term_receipt' && key === 'recurring') {
                                $scope.bookings[key] = _.without($scope.bookings[key], found);
                            }
                            _.each($scope.bookings[key], function (b) {
                                if (b.id === booking) {
                                    b.emails.push({
                                        date: moment().utc().unix(),
                                        email: data.type
                                    });
                                }
                            });
                        }
                    });
                });

                // Start Todo Functions
                $scope.actionStatus = false;
                $scope.todos = [];
                $scope.dateFrom = new Date();
                $scope.dateTo = new Date();
                $scope.deadLine = new Date();
                $scope.done = false;
                $scope.multiple = false;
                $scope.showAll = false;
                $scope.weekDay = 1;
                $scope.inspectForm = false;
                $scope.categoryForInspections = [];
                $scope.collectedItemIds = [];

                $http({
                    url: "http://191.101.12.128:3001/users/getAdmins",
                    method: "GET",
                    headers: {
                        'content-type': 'application/json'
                    }
                }).then(function (res) {
                    $scope.managers = res.data.data;
                });

                $scope.toggleShow = function () {
                    $scope.showAll = !$scope.showAll;
                };

                $scope.todoForm = false;
                $scope.todoFormToggle = function () {
                    $scope.dateFrom = new Date();
                    $scope.dateTo = new Date();
                    $scope.deadLine = new Date();
                    $scope.done = false;
                    $scope.multiple = false;
                    $scope.todoCategory = "";
                    $scope.managersList = "";
                    $scope.timeText = "";
                    $scope.taskText = "";
                    $scope.todoProp = "";
                    $scope.todoId = '';
                    $scope.weekDay = 1;
                    $scope.actionStatus = false;

                    $scope.todoForm = !$scope.todoForm;

                };

                $scope.collectInspectionCategories = function () {
                    var categories = [];
                    for (var i = 0; i < $scope.inspectionTaskData.length; i++) {
                        if (categories.indexOf($scope.inspectionTaskData[i].category) == -1) {
                            categories.push($scope.inspectionTaskData[i].category);
                        }
                    }
                    return categories;
                };
                $scope.getLineColorWithStatus = function (status) {
                    if (status == 1) {
                        return 'litgreen';
                    } else if (status == 3) {
                        return 'litred';
                    }
                };


                $scope.collectItemIds = function () {
                    for (var i = 0; i < $scope.inspectionTaskData.length; i++) {
                        $scope.collectedItemIds[$scope.inspectionTaskData[i]._id] = {
                            value: true,
                            status: 0,
                            text: ' missing',
                            item: $scope.inspectionTaskData[i].item
                        };
                    }
                    console.log("collection items", $scope.collectedItemIds);
                };

                //status codes for inspect actions
                //0 => first position with yes/no
                //1 => when it is ok and the word "ok" is displayed
                //2 => when there is a problem and the input with 'missing' keyword is there to type
                //3 => when it is not ok and input was submitted and the result is displayed

                $scope.changeInspectPropStatus = function (status, id) {
                    console.log($scope.collectedItemIds, id);
                    if (status == 2) {
                        $('#missing-input-' + id).focus(function () {
                            var that = this;
                            setTimeout(function () {
                                that.selectionStart = that.selectionEnd = 0;
                            }, 0);
                        });

                        setTimeout(function () {
                            $('#missing-input-' + id).focus()
                        }, 200)


                    }
                    $scope.collectedItemIds[id].status = status;
                };

                $scope.inspectionItemByCategory = function (category) {
                    var items = $scope.inspectionTaskData.filter(function (prop) {
                        return prop.category == category;
                    });
                    return items;
                };


                $scope.approvePropertyInspection = function () {
                    console.log($scope.collectedItemIds);
                    var isOk = '';
                    for (var i = 0; i < $scope.inspectionTaskData.length; i++) {
                        if ($scope.collectedItemIds[$scope.inspectionTaskData[i]._id].status == 3 || $scope.collectedItemIds[$scope.inspectionTaskData[i]._id].status == 2) {
                            isOk += $scope.collectedItemIds[$scope.inspectionTaskData[i]._id].item + " : " + $scope.collectedItemIds[$scope.inspectionTaskData[i]._id].text + ", \n ";
                        }
                    }
                    if (isOk != "") {
                        $scope.multiple = false;
                        $scope.actionStatus = false;
                        $scope.taskText = 'Inspection Of ' + $scope.todoProp + " Failed! \n" + isOk;
                        $scope.todoCategory = 2;
                        $scope.saveTodo();
                        $scope.checkTodo($scope.todoId);
                        $scope.inspectForm = false;
                        $scope.todoFormToggle();
                    } else {
                        $scope.multiple = false;
                        $scope.actionStatus = false;
                        $scope.taskText = 'Inspection Of ' + $scope.todoProp + " Successful!";
                        $scope.todoCategory = 2;
                        $scope.saveTodo();
                        $scope.checkTodo($scope.todoId);
                        $scope.inspectForm = false;
                        $scope.todoFormToggle();
                    }
                };

                $scope.closeInspectForm = function () {
                    $scope.inspectForm = false;
                };

                $scope.$watch('todoForm', function () {
                    console.log($scope.todoForm, 'watcher');
                });

                $scope.inspectFormToggle = function (property) {
                    $http({
                        url: "http://191.101.12.128:3001/checkList/getCheckListByProperty/" + property,
                        method: "GET",
                        headers: {
                            'content-type': 'application/json'
                        }
                    }).then(function (res) {
                        if (!res.data.error) {
                            $scope.collectedItemIds = [];
                            $scope.categoryForInspections = [];
                            console.log(res.data);
                            $scope.inspectionTaskData = res.data.data;
                            $scope.inspectForm = !$scope.inspectForm;
                            $scope.todoForm = !$scope.todoForm;
                            $scope.categoryForInspections = $scope.collectInspectionCategories();
                            $scope.collectItemIds();
                        }
                    });
                };

                Property.getAll().then(function (data) {
                    $scope.propertiesTodo = data;
                    $scope.GetPropertyLocationName = function (unique) {
                        if (typeof unique != 'undefined') {
                            var current = $scope.propertiesTodo.filter(function (obj) {
                                return obj.unique == unique;
                            });
                            return current[0].projectName;
                        }
                    };
                });

                Todo.list().then(function (data) {
                    $scope.todos = data;
                });

                $scope.todoCategories = [
                    {
                        category: "Cleaning",
                        value: 1
                    },
                    {
                        category: "Defects",
                        value: 2
                    },
                    {
                        category: "Inspection",
                        value: 3
                    }
                ];

                $scope.weekDays = [
                    {
                        weekday: 'Monday',
                        value: 1
                    },
                    {
                        weekday: 'Tuesday',
                        value: 2
                    },
                    {
                        weekday: 'Wednesday',
                        value: 3
                    },
                    {
                        weekday: 'Thursday',
                        value: 4
                    },
                    {
                        weekday: 'Friday',
                        value: 5
                    },
                    {
                        weekday: 'Saturday',
                        value: 6
                    },
                    {
                        weekday: 'Sunday',
                        value: 7
                    }
                ];

                $scope.editTodo = function (id) {
                    var current = $scope.todos.filter(function (todo) {
                        return todo.id == id;
                    });
                    console.log(current, id);

                    current = current[0];

                    $scope.todoId = current.id;
                    $scope.deadLine = new Date(Number(current.dueDate) * 1000);
                    console.log(current.dueDate, Number(current.dueDate) * 1000, new Date(Number(current.dueDate) * 1000));
                    $scope.done = current.done;
                    $scope.todoCategory = Number(current.category);
                    $scope.managersList = current.manager;
                    $scope.timeText = current.time;
                    $scope.taskText = current.taskText;
                    $scope.todoProp = current.propertyId;

                    $scope.todoForm = !$scope.todoForm;
                    $scope.actionStatus = true;

                };

                $scope.$watch('todoProp', function () {
                    if (!$scope.actionStatus && $scope.todoCategory == 3 && $scope.taskText == '') {
                        $scope.taskText = "Inspection for " + $scope.todoProp;
                    }
                });

                $scope.changeColor = function (todo) {
                    if ($scope.calcDays(todo.dueDate) < 0) {
                        return "startBoldTxt startRedTxt"
                    } else if ($scope.calcDays(todo.dueDate) == 0) {
                        return "startBoldTxt"
                    } else {
                        return ""
                    }
                };

                $scope.blackColor = function (todo) {
                    if ($scope.calcDays(todo.dueDate) < 0) {
                        return "startRedTxt"
                    } else if ($scope.calcDays(todo.dueDate) == 0) {
                        return "startBoldTxt"
                    } else {
                        return "startGreenTxt"
                    }
                };

                $scope.saveMultiple = function (arr, index) {
                    var dueDate = Math.round(new Date(arr[index]) / 1000);
                    return Todo.add({
                        'category': $scope.todoCategory,
                        'manager': $scope.managersList,
                        'dueDate': dueDate,
                        'time': $scope.timeText,
                        'taskText': $scope.taskText,
                        'propertyId': $scope.todoProp,
                        'bookingId': '',
                        'done': $scope.done,
                        'createDate': Math.round(new Date() / 1000)
                    }).then(function (data) {
                        if (index + 1 < arr.length) {
                            index++;
                            $scope.saveMultiple(arr, index);
                        } else {
                            $scope.todoFormToggle();
                            $http({
                                url: "http://191.101.12.128:3001/todos/getTodos",
                                method: "GET",
                                headers: {
                                    'content-type': 'application/json'
                                }
                            }).then(function (res) {
                                $scope.todos = [];
                                var todoData = res.data.data
                                for (var i = 0; i < todoData.length; i++) {
                                    $scope.todos.push({
                                        bookingId: todoData[i].bookingId,
                                        category: todoData[i].category,
                                        createDate: todoData[i].createDate,
                                        done: todoData[i].done,
                                        dueDate: todoData[i].dueDate,
                                        id: todoData[i]._id,
                                        manager: todoData[i].manager,
                                        propertyId: todoData[i].propertyId,
                                        taskText: todoData[i].taskText,
                                        time: todoData[i].time
                                    });
                                }
                            });
                        }
                    });
                };

                $scope.saveTodo = function () {
                    var dueDate = Math.round(new Date($scope.deadLine) / 1000);
                    if ($scope.multiple == false) {
                        if ($scope.actionStatus === false) {
                            Todo.add({
                                'category': $scope.todoCategory,
                                'manager': $scope.managersList,
                                'dueDate': dueDate,
                                'time': $scope.timeText,
                                'taskText': $scope.taskText,
                                'propertyId': $scope.todoProp,
                                'bookingId': '',
                                'done': $scope.done,
                                'createDate': Math.round(new Date() / 1000)
                            }).then(function (data) {
                                $scope.todos.push(data);
                                $scope.watchForShowing();
                                $scope.todoFormToggle();
                            })
                        } else {
                            Todo.update({
                                'id': $scope.todoId,
                                'category': $scope.todoCategory,
                                'manager': $scope.managersList,
                                'dueDate': dueDate,
                                'time': $scope.timeText,
                                'taskText': $scope.taskText,
                                'propertyId': $scope.todoProp,
                                'bookingId': '',
                                'done': $scope.done,
                                'createDate': Math.round(new Date() / 1000)
                            }).then(function (data) {
                                var updatedTodos = [];
                                for (var i = 0; i < $scope.todos.length; i++) {
                                    if ($scope.todos[i].id == data.id) {
                                        updatedTodos.push(data)
                                    } else {
                                        updatedTodos.push($scope.todos[i]);
                                    }
                                }
                                $scope.todos = updatedTodos;
                                $scope.todoFormToggle();
                            });
                        }
                    } else {

                        var start = new Date($scope.dateFrom);
                        var end = new Date($scope.dateTo);
                        var weekDay = $scope.weekDay;
                        var timeDiff = Math.abs(end.getTime() - start.getTime());
                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        var changable = start;
                        var DDforMultiple = [];
                        for (var i = 0; i < diffDays; i++) {
                            changable.setDate(changable.getDate() + 1);
                            if (changable.getDay() == weekDay) {
                                DDforMultiple.push(new Date(changable));
                            }
                        }
                        $scope.saveMultiple(DDforMultiple, 0);
                        console.log(DDforMultiple);
                    }
                };

                $scope.deleteTodo = function (id) {
                    Todo.delete(id).then(function (data) {
                        $scope.todos = $scope.todos.filter(function (todo) {
                            return todo.id != id;
                        });
                        $scope.todoFormToggle();
                    });
                };

                $scope.checkTodo = function (id) {
                    var current = $scope.todos.filter(function (todo) {
                        return todo.id == id;
                    });
                    current = current[0];
                    $scope.todoId = current.id;
                    $scope.deadLine = new Date(Number(current.dueDate) * 1000);
                    $scope.done = current.done;
                    $scope.todoCategory = Number(current.category);
                    $scope.managersList = current.manager;
                    $scope.timeText = current.time;
                    $scope.taskText = current.taskText;
                    $scope.todoProp = current.propertyId;
                    $scope.done = true;
                    var dueDate = Math.round(new Date($scope.deadLine) / 1000);
                    Todo.update({
                        'id': $scope.todoId,
                        'category': $scope.todoCategory,
                        'manager': $scope.managersList,
                        'dueDate': dueDate,
                        'time': $scope.timeText,
                        'taskText': $scope.taskText,
                        'propertyId': $scope.todoProp,
                        'bookingId': '',
                        'done': $scope.done,
                        'createDate': Math.round(new Date() / 1000)
                    }).then(function (data) {
                        var updatedTodos = [];
                        for (var i = 0; i < $scope.todos.length; i++) {
                            if ($scope.todos[i].id == data.id) {
                                updatedTodos.push(data)
                            } else {
                                updatedTodos.push($scope.todos[i]);
                            }
                        }
                        $scope.todos = updatedTodos;
                        $scope.deadLine = new Date();
                        $scope.done = false;
                        $scope.multiple = false;
                        $scope.todoCategory = "";
                        $scope.managersList = "";
                        $scope.timeText = "";
                        $scope.taskText = "";
                        $scope.todoProp = "";
                        $scope.todoId = '';
                        $scope.actionStatus = false;
                    });
                };

                $scope.defectTasks = [];
                $scope.watchForShowing = function () {
                    $scope.defectTasks = $scope.todos.filter(function (obj) {
                        return obj.category == "2" && obj.done != true;
                    });
                    $scope.cleaningTasks = $scope.todos.filter(function (obj) {
                        return obj.category == "1" && obj.done != true;
                    });
                    $scope.inspectionTasks = $scope.todos.filter(function (obj) {
                        return obj.category == "3" && obj.done != true;
                    });
                };

                $scope.doneBtn = function () {
                    $scope.checkTodo($scope.todoId);
                    $scope.todoFormToggle();
                };


                $scope.$watch('todos', function () {
                    $scope.watchForShowing();
                });

                // End Of Todo Properties

                //Start Of Expenses Props
                $scope.expenses = [];

                $scope.actionStatusExp = false;

                Expenses.getAll().then(function (data) {
                    $scope.expenses = data.filter(function (obj) {
                        var today = moment();
                        var expDate = moment(new Date(Number(obj.dueDate) * 1000));
                        if (today.diff(expDate, 'days') > -7) {
                            return obj;
                        }
                    });
                });
                Property.getAll().then(function (data) {
                    $scope.propertiesExp = data;
                    console.log(data);
                });

                $scope.calculateMultiplePropRices = function () {
                    var salePrices = [];
                    var propExpPrices = [];
                    var priceMath = 0;
                    for (var i = 0; i < $scope.prop.length; i++) {
                        var current = $scope.propertiesExp.filter(function (obj) {
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
                    if ($scope.prop.length === 1) {
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
                                "dueDate": $scope.dueDate,
                                "fromDate": $scope.fromDate,
                                "toDate": $scope.toDate,
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
                    $scope.dueDate = new Date(current[0].dueDate);
                    $scope.fromDate = new Date(current[0].fromDate);
                    $scope.toDate = new Date(current[0].toDate);
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
                };
                //End Of Expenses Props
                // Start of Invoice Props
                $http({
                    url: CONFIG.HELPER_URL + "/invoice/getInvoicesBayDateRange/",
                    method: "GET",
                    headers: {
                        'content-type': 'application/json'
                    }
                }).then(function (res) {
                    $scope.homeInvoices = res.data.data;
                    $scope.homeInvoices = _.sortBy($scope.homeInvoices, function (o) {
                        return Math.round(new Date(o.dueDate));
                    });
                    $scope.getBookingById = function (bookingId) {
                        var currentBooking = '';
                        for (var i = 0; i < $scope.bookings.arrival.length; i++) {
                            if ($scope.bookings.arrival[i].id == bookingId) {
                                currentBooking = $scope.bookings.arrival[i];
                            }
                        }
                        for (var j = 0; j < $scope.bookings.checkin.length; j++) {
                            if ($scope.bookings.checkin[j].id == bookingId) {
                                currentBooking = $scope.bookings.checkin[j];
                            }
                        }
                        for (var k = 0; k < $scope.bookings.checkout.length; k++) {
                            if ($scope.bookings.checkout[k].id == bookingId) {
                                currentBooking = $scope.bookings.checkout[k];
                            }
                        }
                        for (var l = 0; l < $scope.bookings.new.length; l++) {
                            if ($scope.bookings.new[l].id == bookingId) {
                                currentBooking = $scope.bookings.new[l];
                            }
                        }
                        for (var m = 0; m < $scope.bookings.pending.length; m++) {
                            if ($scope.bookings.pending[m].id == bookingId) {
                                currentBooking = $scope.bookings.pending[m];
                            }
                        }
                        for (var n = 0; n < $scope.bookings.recurring.length; n++) {
                            if ($scope.bookings.recurring[n].id == bookingId) {
                                currentBooking = $scope.bookings.recurring[n];
                            }
                        }
                        return currentBooking;
                    }
                });
                $scope.newDate = function (date) {
                    if (date != "") {
                        return new Date(date);
                    } else {
                        return "";
                    }
                };
                $scope.getBookingUsersLanguage = function (c, id, userId) {
                    Notification.success({
                        message: 'Sending arrival notification email.'
                    });
                    var currentUser = c;
                    var lngCode = '';
                    if (typeof currentUser != 'undefined') {
                        lngCode = CountryToLanguage.getLanguageFromCountryName(currentUser);
                    } else {
                        lngCode = 'gb';
                    }
                    Booking.getDetails(id, lngCode).then(function (data) {
                        var emailPropsForInterpolate = data;
                        emailPropsForInterpolate.data.checkin = moment.unix(emailPropsForInterpolate.data.checkin).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
                        emailPropsForInterpolate.data.checkout = moment.unix(emailPropsForInterpolate.data.checkout).utc().format(CONFIG.DEFAULT_DATE_FORMAT);

                        console.log(" EMAIL PROPS : ", emailPropsForInterpolate);

                        emailPropsForInterpolate.emailFinalPayment = function () {
                            var mustPay = 0;
                            for (var i = 0; i < emailPropsForInterpolate.data.invoice.length; i++) {
                                if (emailPropsForInterpolate.data.invoice[i].paidDate != '') {
                                    mustPay += emailPropsForInterpolate.getInvoiceTotal($scope.data.invoice[i]);
                                }
                            }

                            var payedAmount = 0;
                            for (var j = 0; j < emailPropsForInterpolate.data.receipt.length; j++) {
                                payedAmount += emailPropsForInterpolate.data.receipt[j].amount;
                            }

                            if ((mustPay - payedAmount) > 0) {
                                return emailPropsForInterpolate.T.transMailFinal;
                            }
                        };


                        Email.send('arrivalnotify', {
                            booking: emailPropsForInterpolate.data.id,
                            preview: true,
                            language: lngCode,
                            userID: userId
                        }).then(function (resEmail) {
                            $scope.emailHTML = $sce.trustAsHtml($interpolate(resEmail.html)(emailPropsForInterpolate));
                            $scope.subject = resEmail.subject;

                            Email.send('arrivalnotify', {
                                booking: emailPropsForInterpolate.data.id,
                                customHTML: $scope.emailHTML.toString(),
                                preview: false,
                                customSubject: $scope.subject,
                                language: lngCode,
                                userID: userId,
                                userEmail: emailPropsForInterpolate.data.user.email
                            }).then(function (data) {
                                Notification.success({
                                    message: 'Email sent to ' + emailPropsForInterpolate.data.user.email
                                });
                                var arrivals = [];
                                for (var i = 0; i < $scope.bookings.arrival.length; i++) {
                                    if (emailPropsForInterpolate.data.id != $scope.bookings.arrival[i]._id) {
                                        arrivals.push($scope.bookings.arrival[i]);
                                    }
                                }
                                $scope.bookings.arrival = arrivals;
                            });

                        });
                    })
                };

                $scope.sendNotificationEmail = function (c, id, userId) {
                    $scope.getBookingUsersLanguage(c, id, userId);

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
            }]);
})();
