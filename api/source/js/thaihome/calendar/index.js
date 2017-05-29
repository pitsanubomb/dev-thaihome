(function () {
  "use strict";
  angular.module('ThaiHome')
    .directive("bookingCalendar", ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/thaihome/booking-dates/index.html');
        }
      };
	}])
    .factory("Calendar", ['Locale', 'CONFIG', '$timeout', '$rootScope', function (Locale, CONFIG, $timeout, $rootScope) {
      return {
        nights: function () {
          var dates = Locale.getDates();
          var start = dates.checkin;
          var end = moment(dates.checkout, CONFIG.DEFAULT_DATE_FORMAT);
          var nights = moment(end, CONFIG.DEFAULT_DATE_FORMAT).diff(start, 'days');

          return nights;
        },
        destroy: function () {
          try {
            $('.arrival, .departure').data('dateRangePicker').destroy();
          } catch (e) {

          }
        },
        loadCalendar: function (checkin, checkout, force, bookings) {
          if (Locale.validateDates(checkin, checkout) === false) {
            checkin = false;
            checkout = false;

            if (force === true) {
              var dates = Locale.getDefaultDates();
              checkin = dates.checkin;
              checkout = dates.checkout;
            } else {
              //load dates for localStorage
              var newDates = Locale.getDates();
              if (newDates.valid === true) {
                checkin = newDates.checkin;
                checkout = newDates.checkout;
              }
            }
          }

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
            $('#checkinval').html(moment(d.date1).format(CONFIG.DEFAULT_DATE_FORMAT));
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
              Locale.setDates(s1, s2);
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
            format: CONFIG.DEFAULT_DATE_FORMAT,
          };

          $(document).ready(function () {
			  
			$(document).click(function(e){ // 2016-06-04 - Ajay - Calender always open on book now button click
				if($(e.target).hasClass('book') || $(e.target).parent().hasClass('book')){
					if($('.date-picker-wrapper').is(':visible')){
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
        },
        doubleDates: function (el, event, date1, date2, format) {

          var configObject = {
            showShortcuts: false,
            separator: ' to ',
            minDays: 1,
            setValue: function (s, s1, s2) {
              $rootScope.$broadcast(event, {
                "date1": s1,
                "date2": s2
              });
            },
            autoClose: true,
            format: format ? format : CONFIG.DEFAULT_DATE_FORMAT,
          };

          $(document).ready(function () {
            $timeout(function () {
              if (date1 && date2) {
                $(el).dateRangePicker(configObject).data('dateRangePicker').setDateRange(date1, date2);
              } else {
                $(el).dateRangePicker(configObject);
              }
            });
          });

        },
        singleDate: function (el, event, timestamp) {
          var configObject = {
            showShortcuts: false,
            autoClose: true,
            singleDate: true,
            format: CONFIG.DEFAULT_DATE_FORMAT,
            setValue: function (s) {

              $rootScope.$broadcast(event, moment(s, CONFIG.DEFAULT_DATE_FORMAT).unix());
            }
          };
          $(document).ready(function () {
            $timeout(function () {
              if (timestamp) {
                var date = moment.unix(timestamp).format(CONFIG.DEFAULT_DATE_FORMAT);
                $(el).dateRangePicker(configObject).data('dateRangePicker').setDateRange(date, date);
              } else {
                $(el).dateRangePicker(configObject);
              }
            });
          });
        }
      };
          }]);
})();