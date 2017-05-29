(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('management.calendar', {
                url: 'calendar/:month/:year/',
                title: 'title_calendar',
                css: '/css/admin.css',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/management/calendar/index.html');
                },
                controller: 'ManagementCalendarCtrl',
                resolve: {
                    CalendarData: ["$http", "$q", "$stateParams", "CONFIG", function ($http, $q, $stateParams, CONFIG) {
                        var deferred = $q.defer();
                        $http.get(CONFIG.API_URL + '/calendar', {
                            params: {
                                month: $stateParams.month === '' ? moment().format('M') : moment($stateParams.month, 'MMMM').format('M'),
                                year: $stateParams.year || moment().format('YYYY')
                            }
                        }).then(function (data) {
                            deferred.resolve(data.data);
                        }).catch(function (err) {
                            deferred.reject(err, 404);
                        });
                        return deferred.promise;
                    }]
                }
            });
        }])
        .controller('ManagementCalendarCtrl', ["CalendarData", "$scope", "$stateParams", "$state", "Booking", "CONFIG", "$timeout", "Notification", "Locale", function (CalendarData, $scope, $stateParams, $state, Booking, CONFIG, $timeout, Notification, Locale) {
            $scope.data = CalendarData;
            $scope.year = $stateParams.year || moment().format('YYYY');
            $scope.month = $stateParams.month === '' ? moment().format('MMMM') : moment($stateParams.month, 'MMMM').format('MMMM');
            $scope.nextMonth = moment($stateParams.month, 'MMMM').add(1, 'month').format('MMMM');
            var colors = {
                0: "#f07f75",
                1: "#f07f75",
                2: "#66D16E",
                3: "#66D16E",
                4: "#A6A6A6",
                5: "#A6A6A6",
                6: "#A6A6A6"
            };

            var startDate = moment($scope.year + '-' + $scope.month + '-01', 'YYYY-MMMM-DD').format('YYYY-MM-DD');

            var settings = {
                "url": "https://beds24.com/api/json/getBookings",
                "method": "POST",
                "data": "{\r\n                    \"authentication\": {\r\n                        \"apiKey\": \"ThaiHomeTestingSync\",\r\n                        \"propKey\": \"ThaiHomeTestingWAT\"\r\n                    },\r\n                    \"includeInvoice\": false,\r\n                    \"includeInfoItems\": false\r\n                }"
            };

            $.ajax(settings).done(function (response) {
                console.log(response);
            });

            $scope.dates = {
                start: 1,
                end1: moment('01-' + $scope.month + '-' + $scope.year, 'DD-MMMM-YYYY').endOf('month').format('DD'),
                end2: moment('01-' + $scope.month + '-' + $scope.year, 'DD-MMMM-YYYY').add(1, 'month').endOf('month').format('DD')
            };

            var monthsCount = 1;
            if (window.innerWidth < 768) {
                monthsCount = 0;
            }

            var days = moment('01-' + $scope.month + '-' + $scope.year, 'DD-MMMM-YYYY').add(monthsCount, 'month').endOf('month').diff(moment('01-' + $scope.month + '-' + $scope.year, 'DD-MMMM-YYYY'), 'days') + 1;
            if ($stateParams.month == '' && $stateParams.year == '') {
                startDate = moment().subtract(3, 'day').format('YYYY-MM-DD');
            }

            $scope.reload = function () {
                $state.go('management.calendar', {
                    year: $scope.year,
                    month: $scope.month
                }, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            };

            $scope.getClassNameForSource = function (source) {
                return "startBook" + source;
            };

            $scope.next = function () {
                var month = parseInt(moment($scope.month, 'MMMM').format('M'));
                month++;
                var year = $scope.year;
                if (month === 13) {
                    month = 1;
                    year++;
                }
                $scope.month = moment(month, 'M').format('MMMM');
                $scope.year = year;
                $scope.reload();
            };

            $scope.previous = function () {
                var month = parseInt(moment($scope.month, 'MMMM').format('M'));
                month--;
                var year = $scope.year;
                if (month === 0) {
                    month = 12;
                    year--;
                }
                $scope.month = moment(month, 'M').format('MMMM');
                $scope.year = year;
                $scope.reload();
            };

            $scope.status = function (s) {
                return Booking.getStatus(s).name;
            };


            var dp = new DayPilot.Scheduler("dp");
            dp.startDate = startDate;
            dp.days = days;
            dp.scale = "Day";
            dp.timeHeaders = [
                {
                    groupBy: "Month",
                    format: "MMM yyyy"
                },
                {
                    groupBy: "Cell",
                    format: "ddd"
                },
                {
                    groupBy: "Cell",
                    format: "d"
                }
            ];

            dp.bubble = new DayPilot.Bubble();
            dp.resourceBubble = new DayPilot.Bubble();

            dp.contextMenu = new DayPilot.Menu({
                items: [
                    {
                        text: "Select",
                        onclick: function () {
                            dp.multiselect.add(this.source);
                        }
                    }
                ]
            });

            var children = _.map($scope.data.properties, function (p) {
                return {
                    name: p.unique,
                    id: p.unique
                };
            });

            dp.treeEnabled = false;
            dp.resources = children;

            dp.heightSpec = "Max";
            dp.height = 35 * $scope.data.properties.length;
            dp.events.list = [];

            _.each($scope.data.data, function (d) {
                var e = {
                    start: new DayPilot.Date(d.checkin),
                    end: new DayPilot.Date(d.checkout),
                    id: DayPilot.guid(),
                    resource: d.property,
                    text: '<div style="color:#fff;background:' + colors[d.status] + ';"><span class="startBook' + d.source + '">' + d.source + '</span><b> ' + d.user + '</b><div>',
                    status: d.status,
                    moveDisabled: true,
                    resizeDisabled: true,
                    bid: d.id,
                    cssClassPrefix: "bubble_thaihome"
                };
                dp.events.list.push(e);
            });
            dp.cellWidthSpec = 'Auto';


            dp.eventMovingStartEndEnabled = true;
            dp.eventResizingStartEndEnabled = false;
            dp.timeRangeSelectingStartEndEnabled = true;

            dp.onBeforeResHeaderRender = function (args) {
                args.resource.bubbleHtml = "ThaiHome Calendar";
            };
            dp.onBeforeCellRender = function (args) {
                if (args.cell.start.getDayOfWeek() === 0 || args.cell.start.getDayOfWeek() === 6) {
                    args.cell.backColor = "#d6d6d6";
                }
            };
            dp.onBeforeCellRender = function (args) {
                if (args.cell.start <= DayPilot.Date.today() && DayPilot.Date.today() < args.cell.end) {
                    args.cell.backColor = "#FFE77A";
                }
            };

            dp.onBeforeRowHeaderRender = function (args) {
            };

            dp.onBeforeEventRender = function (args) {
                args.data.bubbleHtml = "<div class='man_calendar_pop' style='background:#e8f896;margin:-5px;padding:3px;border:1px solid #000'><b>" + args.data.text.replace('style="color:yellow"', '') + "</b></div><div><b>" + $scope.status(args.data.status) + "</b></div><div>Start: " + new DayPilot.Date(args.data.start).toString("dd/MM/yyyy") + "</div><div>End: " + new DayPilot.Date(args.data.end).toString("dd/MM/yyyy") + "</div>";
            };

            dp.onTimeRangeSelected = function (args) {
                Notification.success({
                    message: 'Checking dates...'
                });
                var checkin = moment(args.start.toString().split('T')[0], 'YYYY-MM-DD').format(CONFIG.DEFAULT_DATE_FORMAT);
                var checkout = moment(args.end.toString().split('T')[0], 'YYYY-MM-DD').subtract(1, 'day').format(CONFIG.DEFAULT_DATE_FORMAT);
                Booking.check(args.resource, null, {
                    checkin: checkin,
                    checkout: checkout
                }).then(function (data) {
                    dp.clearSelection();
                    if (data) {
                        alert('Dates already booked');
                    } else {
                        $timeout(function () {
                            if (confirm('Create Booking?')) {
                                Locale.setDates(checkin, checkout);
                                $scope.doBooking(args);
                            }
                        });
                    }
                });
            };

            $scope.doBooking = function (data) {
                $state.go('management.book', {
                    property: data.resource,
                    start: moment(data.start.value).format('MMM D, YYYY'),
                    end: moment(data.end.value).subtract(1, 'day').format('MMM D, YYYY')
                });
            };

            dp.treePreventParentUsage = true;

            dp.onEventClicked = function (args) {
                var url = $state.href('management.booking', {
                    id: args.e.data.bid
                });
                window.open(url, '_self');
            };
            var separators = [];

            for (var i = 0; i <= days; i++) {
                var d = moment('01-' + parseInt(moment($scope.month, 'MMMM').format('MM')) + '-' + $scope.year, 'DD-MM-YYYY').add(i, 'days');
                if (d.weekday() == 1) {
                    separators.push({
                        color: 'black',
                        location: d.format('YYYY-MM-DD'),
                        width: 1
                    });
                }
            }

            //dp.separators = separators;

            dp.init();
            $('.scheduler_default_corner').html('');

        }])
        .directive('yearDrop', function () {
            function getYears(offset, range) {
                var currentYear = parseInt(moment().format('YYYY'));
                var years = [];
                for (var i = 0; i < range + 1; i++) {
                    years.push(currentYear + offset + i);
                }
                return years;
            }

            return {
                link: function (scope, element, attrs) {
                    scope.years = getYears(+attrs.offset, +attrs.range);
                    scope.year = parseInt(attrs.year);
                },
                template: '<select ng-model="year" ng-options="y for y in years"></select>'
            };
        })
        .directive('monthDrop', function () {
            function getMonths() {
                var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                return months;
            }

            return {
                link: function (scope, element, attrs) {
                    scope.months = getMonths();
                    scope.month = attrs.month;
                },
                template: '<select ng-model="month" ng-options="m for m in months"></select>'
            };
        })
        .filter('range', function () {
            return function (input, total) {
                total = parseInt(total);

                for (var i = 1; i <= total; i++) {
                    input.push(i);
                }

                return input;
            };
        })
        .filter('dayName', function () {
            return function (day, month) {
                return moment(day + ' ' + month, 'DD MMMM').format('dd DD');
            };
        });
})();
