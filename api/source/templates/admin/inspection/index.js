(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('admin.inspection', {
                    url: 'inspection/',
                    css: '/css/admin.css',
                    controller: 'InspectionCtrl',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/admin/inspection/index.html');
                    }
                })
                .state('admin.inspection.view', {
                    url: 'view/:id/',
                    css: '/css/admin.css',
                    controller: 'InspectionCtrl',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/admin/inspection/view.html');
                    }
                })
                .state('admin.inspection.add', {
                    url: 'add/',
                    css: '/css/admin.css',
                    controller: 'InspectionCtrl',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/admin/inspection/view.html');
                    }
                });
        }])
        .controller('InspectionCtrl', ['$stateParams', '$scope', '$state', 'Property', '$http', 'Checklist', 'Chacklistcategory', 'Notification',
            function ($stateParams, $scope, $state, Property, $http, Checklist, Chacklistcategory, Notification) {
                $scope.properties = [];

                $scope.pops = {
                    from: "",
                    to: ""
                };

                Property.getAll().then(function (data) {
                    $scope.properties = data;
                    console.log(' properties ', data);
                });
                Chacklistcategory.list().then(function (data) {
                    $scope.checkCategories = data;
                    console.log(' categories ', data);
                });

                $scope.copyInspectionChecks = function () {
                    console.log($scope.fromProp, $scope.toProp);
                    Checklist.copy($scope.pops).then(function () {
                        Notification.success({
                            message: 'Copy Successful!'
                        });
                    });
                };

                $scope.inspections = [];

                if (typeof $stateParams.id != 'undefined') {
                    $scope.currentPropId = $stateParams.id;
                    $http.get('http://191.101.12.128:3001/checklist/getCheckListByProperty/' + $stateParams.id).then(function (data) {
                        $scope.inspections = data.data.data;
                        console.log(data);
                        $scope.actionStatus = true;

                        $scope._id = '';
                        $scope.category = '';
                        $scope.item = '';
                        $scope.property = $stateParams.id;

                        $scope.toggleActionStatus = function () {
                            $scope.actionStatus = !$scope.actionStatus;
                        };
                        $scope.saveStatus = true;

                        $scope.updateInspection = function (id) {
                            var current = $scope.inspections.filter(function (inspection) {
                                return inspection._id == id;
                            });
                            $scope.saveStatus = false;
                            current = current[0];
                            console.log(current);
                            $scope._id = current._id;
                            $scope.category = current.category;
                            $scope.item = current.item;
                            $scope.property = current.property;
                            $scope.toggleActionStatus();
                        };
                    })
                }

                $scope.cleanBuffer = function () {
                    $scope._id = '';
                    $scope.category = '';
                    $scope.item = '';
                    $scope.property = $stateParams.id;
                    $scope.saveStatus = true;
                };

                $scope.cancel = function () {
                    $scope.cleanBuffer();
                    $scope.toggleActionStatus();
                };

                $scope.saveItem = function () {
                    if ($scope.saveStatus) {
                        Checklist.add({
                            category: $scope.category,
                            item: $scope.item,
                            property: $scope.property
                        }).then(function (data) {
                            $scope.inspections.push({
                                _id: data.id,
                                category: data.category,
                                item: data.item,
                                property: data.property
                            });
                            $scope.cancel();
                        })
                    } else {
                        Checklist.update({
                            id: $scope._id,
                            category: $scope.category,
                            item: $scope.item,
                            property: $scope.property
                        }).then(function (data) {
                            for (var i = 0; i < $scope.inspections.length; i++) {
                                if ($scope.inspections[i]._id == $scope._id) {
                                    $scope.inspections[i] = {
                                        _id: data.id,
                                        category: data.category,
                                        item: data.item,
                                        property: data.property
                                    };
                                }
                            }
                            $scope.cancel();
                            console.log(data);
                        });
                    }
                };


                $scope.deleteInspection = function (id) {
                    Checklist.delete(id).then(function (data) {
                        $scope.inspections = $scope.inspections.filter(function (inspection) {
                            return inspection._id != id;
                        });
                    });
                };

            }]);
})();