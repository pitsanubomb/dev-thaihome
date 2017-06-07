import angular from 'angular';

//Set factory name and app
// Not yet to do
//  -- set datetimepick jquery(Find in bower to split)
//  -- set env.js run by use webpack
//  -- set lodash (https://lodash.com/docs/) Document
//  -- set moment or date time for date time picker 

const Calendar = angular.module('app.Calendar', [])

    .factory('Calendar', ($timeout, $rootScope) => {
        return {
            loadCalendar: function (checkin, checkout, force, bookings) {
                console.log("LOAD CALENDAR CALLED")
                // if (Locale.validateDates(checkin, checkout) === false) {
                //     checkin = false;
                //     checkout = false;

                //     if (force === true) {
                //         var dates = Locale.getDefaultDates();
                //         checkin = dates.checkin;
                //         checkout = dates.checkout;
                //     } else {
                //         //load dates for localStorage
                //         var newDates = Locale.getDates();
                //         if (newDates.valid === true) {
                //             checkin = newDates.checkin;
                //             checkout = newDates.checkout;
                //         }
                //     }
                // }

                function check(time) {
                    var utc = moment.utc(parseInt(time.getTime() / 1000), 'X').add('0', 'day').format('X');
                    if (bookings) {
                        for (var i = 0; i < bookings.length; i++) {
                            if (utc >= bookings[i].checkin && utc <= bookings[i].checkout) {
                                return false;
                            }
                        }
                    }
                    return true;
                }

                function highlightField(el) {
                    if (el === false) {
                        $('.arrival, .departure').removeClass('highlight');
                    } else {
                        $(el).addClass('highlight');
                    }
                }

                function setFirstDate(d) {
                    $('#checkinval').html(moment(d.date1).format('MMM D, YYYY'));
                }

                var configObject = {
                    showShortcuts: false,
                    separator: ' to ',
                    minDays: 1,
                    minDate: new Date(),
                    singleMonth: $(window).width() < 400 ? true : false,
                    stickyMonths: $(window).width() < 400 ? false : true,
                    getValue: function () {
                        if ($('#arrival').val() && $('#departure').val())
                            return $('#arrival').val() + ' to ' + $('#departure').val();
                        else
                            return '';
                    },
                    setValue: function (s, s1, s2) {
                        highlightField(false);
                        $('#checkinval').html(s1);
                        $('#checkoutval').html(s2);
             
                        $rootScope.$broadcast("datesChanged", {
                            "checkin": s1,
                            "checkout": s2
                        });
                    },
                    selectForward: true,
                    customTopBar: '<span class="calendar_current_selection"></span>',
                    beforeShowDay: function (t) {
                        //disable booked and past days
                        var valid = !((new Date().getTime() - t) >= (24 * 60 * 60 * 1000));
                        var _class = '';
                        var _tooltip = valid ? '' : '';
                        if (bookings) {
                            if (!check(t)) {
                                valid = false;
                                _tooltip = 'Already Booked';
                            }
                        }
                        return [valid, _class, _tooltip];
                    },
                    autoClose: true,
                    format: 'MMM D, YYYY',
                };

                $(document).ready(function () {

                    $(document).click(function (e) { // 2016-06-04 - Ajay - Calender always open on book now button click
                        if ($(e.target).hasClass('book') || $(e.target).parent().hasClass('book')) {
                            if ($('.date-picker-wrapper').is(':visible')) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                            }
                        }
                    });

                    $('.departure').click(function (e) {
                        $('.arrival').click();
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    });
                    $('.arrival').removeClass('highlight');
                    $timeout(function () {
                        if (checkin && checkout) {
                            $('.arrival, .departure').dateRangePicker(configObject).bind('datepicker-open', function () {
                                $('.calendar_current_selection').html('CHOOSE <span class="calendar_text_border">CHECK-IN DATE</span>');
                                highlightField('.arrival');
                            }).bind('datepicker-first-date-selected', function (o, d) {
                                $('.calendar_current_selection').html('CHOOSE <span class="calendar_text_border">CHECK-OUT DATE</span>');
                                $('.arrival').removeClass('highlight');
                                highlightField('.departure');
                                $('#checkoutval').html('Check-out');
                                //setFirstDate(d);
                            }).data('dateRangePicker').setDateRange(checkin, checkout);
                        } else {
                            $('.arrival, .departure').dateRangePicker(configObject).bind('datepicker-open', function () {
                                $('.calendar_current_selection').html('CHOOSE <span class="calendar_text_border">CHECK-IN DATE</span>');
                                highlightField('.arrival');
                            }).bind('datepicker-first-date-selected', function (o, d) {
                                $('.calendar_current_selection').html('CHOOSE <span class="calendar_text_border">CHECK-OUT DATE</span>');
                                $('.arrival').removeClass('highlight');
                                highlightField('.departure');
                                $('#checkoutval').html('Check-out');
                                setFirstDate(d);
                            });
                        }
                    });
                    $('.departure').removeClass('highlight');
                });
            }
        }
    });

export default Calendar;