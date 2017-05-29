(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('management.todo', {
                    url: 'todo/',
                    controller: 'ManagerToDoCtrl',
                    title: 'title_management_todo',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/management/todo/index.html');
                    },
                    css: ['/css/admin.css']
                });
        }]).directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    })
        .controller('ManagerToDoCtrl', ['$scope', 'Todo', 'Property', '$http', 'Chacklistcategory',
            function ($scope, Todo, Property, $http, Chacklistcategory) {
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
                    $scope.properties = data;
                    $scope.GetPropertyLocationName = function (unique) {
                        if (typeof unique != 'undefined') {
                            var current = $scope.properties.filter(function (obj) {
                                return obj.unique == unique;
                            });
                            return current[0].projectName;
                        }
                    };
                });

                $scope.calcDays = function (a, b) {
                    if (!b) b = moment().utc().unix();
                    //a = Math.round(new Date(a) / 1000);
                    return moment.utc(a, 'X').diff(moment.utc(b, 'X'), 'days');
                };

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
            }]);

})();
