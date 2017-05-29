(function () {
  'use strict';
  angular
    .module('ThaiHome', ['angularMoment', 'underscore', 'ngRoute', 'ngMap', 'ngMaterial', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ngTouch', 'duScroll', 'ngResource', 'templates-main', 'dpd', 'datatables', 'xeditable', 'ui-notification', 'routeStyles', 'angularFileUpload', 'credit-cards', 'ui.sortable', 'multiStepForm', 'textAngular', 'ENV', 'vcRecaptcha','ngclipboard'])
    .value('dpdConfig', {
      collections: ['discount', 'booking', 'users', 'language', 'translation', 'news'],
      serverRoot: '/api/', // optional, defaults to same server
      socketOptions: {
        reconnectionDelayMax: 3000
      }, // optional socket io additional configuration
      noCache: false // optional, defaults to false (false means that caching is enabled, true means it disabled)
    })
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', 'NotificationProvider', function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, NotificationProvider) {
      $httpProvider.defaults.withCredentials = true;
      NotificationProvider.setOptions({
        delay: 5000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'top'
      });



      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/');
      $urlRouterProvider.rule(function ($injector, $location) {
        var path = $location.url();

        if ('/' === path[path.length - 1] || path.indexOf('/?') > -1) {
          return;
        }

        if (path.indexOf('?') > -1) {
          return path.replace('?', '/?');
        }

        return path + '/';
      });

      }])
      .config(function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
       return moment(date).format('DD/MM/YYYY');
    };
  })

  .run(['$rootScope', 'Locale', '$state', 'Auth', '$q', 'editableOptions', 'editableThemes', '$timeout', 'CONFIG', 'Language','Currency', function ($rootScope, Locale, $state, Auth, $q, editableOptions, editableThemes, $timeout, CONFIG, Language, Currency) {
      editableOptions.theme = 'bs3';
      editableThemes.bs3.inputClass = 'input';
      editableThemes.bs3.buttonsClass = 'btn-primary';
      Auth.checkLogged();
      Language.getAll().then(function(data){
          $rootScope.languages  = data;
          Locale.init();
      });
      Currency.getAll().then(function(data){
          $rootScope.currencies = data;
      });
      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (toState.name.split('.')[0] === 'management') localStorage.setItem('currency', CONFIG.DEFAULT_CURRENCY);
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        $timeout(function () {
          //window.document.title = 'ThaiHome - ' + $rootScope.T[$state.current.title];
        });

        $(".page-loading").addClass("hide");
        $timeout(function () {
          window.prerenderReady = true;
        }, 3000);

      });

      $rootScope.formatMoney = function (n, c, d, t) {
          var c = isNaN(c = Math.abs(c)) ? 2 : c,
              d = d == undefined ? "." : d,
              t = t == undefined ? "," : t,
              s = n < 0 ? "-" : "",
              i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
              j = (j = i.length) > 3 ? j % 3 : 0;
          return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
      };

      $rootScope.bothPrices = function(price, currency, rate, format){
          if(currency == '฿' || format == 'left'){
              return String( "฿  " + $rootScope.formatMoney(price ,0,'.',','));
          }else{
              if(format == 'both'){
                  return String( "฿  " + price + ' (' + currency + ' ' + Math.round(price * rate) + ') ' );
              }else{
                  return String( currency + ' ' + Math.round(price * rate) );
              }
          }
      }
      window.bothPrices = function(price, currency, rate, format){
          if(currency == '฿' || format == 'left'){
              return String( "฿  " + $rootScope.formatMoney(price ,0,'.',','));
          }else{
              if(format == 'both'){
                  return String( "฿  " + price + ' (' + currency + ' ' + Math.round(price * rate) + ') ' );
              }else{
                  return String( currency + ' ' + Math.round(price * rate) );
              }
          }
      }

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (toState.resolve) {
          //$("#ui-view").html("");
          if(toState.url.indexOf('/voucher-print') != -1){
            $(".page-loading").addClass("hide");
          }else{
            $(".page-loading").removeClass("hide");
          }

        }
      });

      $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        $(".page-loading").addClass("hide");
        $state.go('home');
      });
    }])
    .filter('currency', ['$rootScope', function ($rootScope) {
      return function (sum, currency, dec, rate) {
        return currency + ' ' + (parseInt(sum) * (rate ? rate : $rootScope.currencyRate)).toFixed(0);
      };
	}])
    .filter('defaultDateFormat', ['CONFIG', function (CONFIG) {
      return function (timestamp) {
        return moment.unix(timestamp).format(CONFIG.DEFAULT_DATE_FORMAT);
      };
	}])
    .filter('defaultFullDateFormat', ['CONFIG', function (CONFIG) {
      return function (timestamp) {
        return moment.unix(timestamp).format(CONFIG.DEFAULT_FULL_DATE_FORMAT);
      };
	}])
    .filter('shortDateFormat', ['CONFIG', function (CONFIG) {
      return function (timestamp) {
        return moment.unix(timestamp).format(CONFIG.SHORT_DATE_FORMAT);
      };
	}])
    .filter('currencyConv', function () {
      return function (sum, currency) {
        return currency + ' ' + sum.toFixed(0).replace('.00', '').replace('.', ',');

      };
    })
    .filter('timeAgo', function () {
      return function (timestamp) {
        return moment.duration(moment(timestamp, 'x') - moment().unix(), 's').humanize(true);

      };
    })
    .filter('monthName', function () {
      return function (month) {
        return moment.monthsShort()[parseInt(month) - 1];

      };
    })
    .filter('timeFormat', function () {
      return function (days) {
        var x = [];
        var a = moment.duration(days, "days").format('Y,M,W,D');
        var arr = a.split(',');
        arr = arr.reverse();
        if (arr[3] > 0) {
          x.push(arr[3] + ' ' + (arr[3] > 1 ? 'years' : 'year'));
        }
        if (arr[2] > 0) {
          x.push(arr[2] + ' ' + (arr[2] > 1 ? 'months' : 'month'));
        }
        if (arr[1] > 0) {
          x.push(arr[1] + ' ' + (arr[1] > 1 ? 'weeks' : 'week'));
        }
        if (arr[0] > 0) {
          x.push(arr[0] + ' ' + (arr[0] > 1 ? 'nights' : 'night'));
        }
        var y = x.join(', ');

        return y;
      };
    })
	.filter('nl2br', function($sce){  /** 2016-06-07 - Ajay - Create filter for line break **/
		return function(msg,is_xhtml) {
			var is_xhtml = is_xhtml || true;
			var breakTag = (is_xhtml) ? '<br />' : '<br>';
			var msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
			return $sce.trustAsHtml(msg);
		}
	})
	.filter('capitalize', function() {
		return function(input) {
		  return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
		}
	})
    .directive('ngReallyClick', [function () {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.bind('click', function () {
            var message = attrs.ngReallyMessage;
            if (message && confirm(message)) {
              scope.$apply(attrs.ngReallyClick);
            }
          });
        }
      };
}])
    .directive('imageonload', function () {
      return {
        restrict: 'A',

        link: function (scope, element) {
          element.bind('load', function () {
            // Set visibility: true + remove spinner overlay
            element.removeClass('spinner-hide');
            element.addClass('spinner-show');
            element.parent().find('span').remove();
          });
          scope.$watch('ngSrc', function () {
            // Set visibility: false + inject temporary spinner overlay
            element.addClass('spinner-hide');
            // element.parent().append('<span class="spinner"></span>');
          });
        }
      };
    });
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.bookings', {
          url: 'bookings/',
          css: '/css/admin.css',
          controller: 'BookingsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/bookings/index.html');
          },
          resolve: {
            Bookings: ['Booking', '$q', '$rootScope', function (Booking, $q, $rootScope) {
              var d = $q.defer();
              Booking.find().then(function (data) {
                $rootScope.menu_bookings = data.data.length;
                d.resolve(data.data);
              }).catch(function () {
                $rootScope.menu_bookings = 0;
                d.resolve([]);
              });

              return d.promise;

            }],
            BookingData: [function () {
              return {};
          }]
          }
        })
        .state('admin.bookings.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'BookingsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/bookings/view.html');
          },
          resolve: {
            BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
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
    .controller('BookingsCtrl', ['$scope', '$state', '$rootScope', 'Modal', 'Calendar', '$timeout', '$http', 'CONFIG', 'Notification', 'Property', 'Locale', 'Booking', 'BookingData', 'Bookings', 'DTOptionsBuilder','vcRecaptchaService', function ($scope, $state, $rootScope, Modal, Calendar, $timeout, $http, CONFIG, Notification, Property, Locale, Booking, BookingData, Bookings, DTOptionsBuilder,vcRecaptchaService) {
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      if (BookingData.data) {
        $scope.data = BookingData.data;
        $scope.data.priceExtra = $scope.data.priceExtra || [];
      } else {
        $scope.data = {
          property: {}
        };
      }
	  
	  /*** SYN- For Delete All Bookings ***/
		
		$scope.publicKey = CONFIG.PUBLIC_KEY;
		$scope.selected = {};
		$scope.selectAll = false;
		$scope.disabled = true;
	
		$scope.toggleAll = toggleAll;
		$scope.toggleOne = toggleOne;
	  
		function toggleAll (selectAll, selectedItems) {
			for (var id in selectedItems) {
				if (selectedItems.hasOwnProperty(id)) {
					selectedItems[id] = selectAll;
				}
			}			
		}
		function toggleOne (selectedItems) {
			for (var id in selectedItems) {
				if (selectedItems.hasOwnProperty(id)) {
					if(!selectedItems[id]) {
						$scope.selectAll = false;
						return;
					}
				}
			}
			$scope.selectAll = true;
		}
		
		angular.forEach(Bookings, function(book){
			$scope.selected[book.id] = false;
		});
		
		 $scope.verifyCallback = function(response){
			$scope.disabled = false;
		};
		
		 $scope.expiredCallback = function(response) {
			$scope.disabled = true;
		};
	  
		/**
	    * 2016-05-13 - Ajay - Delete Selected & All bookings
	    **/
		
		$scope.deleteSelected = function (deleteStatus) {
			if(vcRecaptchaService.getResponse() === ""){
				alert("Please resolve the captcha and delete!")
			}else{
				if(deleteStatus){
					 $(".page-loading").removeClass("hide");	
					var data = {'Event':'DELETE', 'Type':'All', 'Collection':'booking'};
					Booking.deleteAll(data).then(function(){
						Notification.success({
							message: 'All Bookings Deleted !'
						});
						$state.go('admin.bookings', {}, {
							reload: true
						});
					}).catch(function (err) {
						if (err.data && err.data.errors) {
							Notification.error({
								message: JSON.stringify(err.data.errors)
							});
							 $(".page-loading").addClass("hide");
						} else {
							Notification.error({
								message: JSON.stringify(err.data)
							});
							 $(".page-loading").addClass("hide");
						}
					});
				}else{	
					var ids = [];
					 $(".page-loading").removeClass("hide");	
					angular.forEach($scope.selected, function(status,id){
						if(status==true){
							ids.push(id);
						}						
					});
					if(ids.length>0){
						var data = {'Event':'DELETE', 'Type':'Selected', 'ids':ids, 'Collection':'booking'};
						Booking.deleteAll(data).then(function () {
							Notification.success({
								message: 'Selected Bookings Deleted !'
							});
							$state.go('admin.bookings', {}, {
								reload: true
							});
						}).catch(function (err) {
							if (err.data && err.data.errors) {
								Notification.error({
									message: JSON.stringify(err.data.errors)
								});
								 $(".page-loading").addClass("hide");
							}else{
								Notification.error({
									message: JSON.stringify(err.data)
								});
								 $(".page-loading").addClass("hide");
							}
						});	
					}else{
						alert("Please select booking for delete!");
						 $(".page-loading").addClass("hide");
						
					}			
				}				
			}
		};
		
		/*** For Checkbox End ***/

      $scope.bookings = Bookings;
      $scope.bookingType = "0";

      $scope.getStatus = function (status) {
        return Booking.getStatus(status);
      };

      $scope.data.checkin = moment.unix($scope.data.checkin).format(CONFIG.DEFAULT_DATE_FORMAT);
      $scope.data.checkout = moment.unix($scope.data.checkout).format(CONFIG.DEFAULT_DATE_FORMAT);
      Property.getDetails($scope.data.property.unique).then(function (data) {
        $scope.fullPrice = data.data.price;
        Calendar.loadCalendar(false, false, false, data.data.bookings);
      });



      $scope.options = {
        calendarOpened: true
      };

      $scope.addExtra = function () {
        $scope.data.priceExtra.push({
          name: "Add a name",
          price: 0
        });
      };

      $scope.removeExtra = function (i) {
        $scope.data.priceExtra.splice(i, 1);
        $scope.calcExtra();
      };
      $scope.calcExtra = function () {
        var total = 0;
        _.each($scope.data.priceExtra, function (item) {
          total = total + parseInt(item.price);
        });
        $scope.priceExtraCalc = total;

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

      $scope.openCalendar = function () {
        if (!$scope.data.property.id) {
          return Notification.error({
            message: 'Please select a property first'
          });
        }
        $scope.options.calendarOpened = true;
        $timeout(function () {
          $('.arrival').data('dateRangePicker').open();
        });

      };

      $scope.emailList = function () {
        Modal.emailList($scope.data.id, $scope.data.emails);
      };

      $rootScope.$on("propertySelected", function (event, property) {
        Locale.deleteDates();
        Notification.info({
          message: 'Please reselect booking dates'
        });
        if ($scope.data.property.id) {
          Calendar.destroy();
        }
        Property.getDetails(property.unique).then(function (data) {
          $scope.fullPrice = data.data.price;
          Calendar.loadCalendar(false, false, false, data.data.bookings);
        });

        $timeout(function () {
          $scope.data.property = property;
          $scope.data.checkin = false;
          $scope.data.checkout = false;
        });
      });

      $rootScope.$on("agentSelected", function (event, agent) {
        $scope.data.agent = agent;
      });

      $rootScope.$on("tenantSelected", function (event, tenant) {
        $scope.data.user = tenant;
      });

      $rootScope.$on("discountSelected", function (event, discount) {
        $scope.data.discount = discount;
      });

      $rootScope.$on("statusSelected", function (event, status) {
        $scope.data.status = status.value;
      });

      $rootScope.$on("datesChanged", function (event, dates) {
        if ($scope.options.calendarOpened) {
          $timeout(function () {
            $scope.data.checkin = dates.checkin;
            $scope.data.checkout = dates.checkout;
            $http.get(CONFIG.API_URL + '/getprice', {
              params: {
                "property": $scope.data.property.id,
                "checkin": dates.checkin,
                "checkout": dates.checkout,
                "format": CONFIG.DEFAULT_DATE_FORMAT
              }
            }).success(function (data) {
              $scope.data.priceDay = data.price;
              $scope.data.nights = data.nights;
              if (data.nights < 7) {
                $scope.data.agentCommission = $scope.fullPrice.commissionDay;
              } else if (data.nights < 30) {
                $scope.data.agentCommission = $scope.fullPrice.commissionWeek;
              } else if (data.nights < 365) {
                $scope.data.agentCommission = $scope.fullPrice.commissionMonth;
              } else {
                $scope.data.agentCommission = $scope.fullPrice.commissionYear;
              }

            });
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

      $scope.update = function () {
        var booking = {
          "property": $scope.data.property.id,
          "user": $scope.data.user.id,
          "agent": $scope.data.agent.id ? $scope.data.agent.id : '',
          "agentCommission": $scope.data.agentCommission,
          "discount": $scope.data.discount.id,
          "discountPercentage": $scope.data.discount.percent,
          "checkin": $scope.data.checkin ? moment($scope.data.checkin, CONFIG.DEFAULT_DATE_FORMAT).unix() : '',
          "checkout": $scope.data.checkout ? moment($scope.data.checkout, CONFIG.DEFAULT_DATE_FORMAT).unix() : '',
          "status": $scope.data.status,
          "currency": $scope.data.currency,
          "priceExtra": $scope.data.priceExtra,
          "paymentType": $scope.data.paymentType,
          "priceDay": $scope.data.priceDay,
          "created": moment().unix(),
          "utilitiesElectricity": $scope.data.utilitiesElectricity,
          "utilitiesWater": $scope.data.utilitiesWater,
          "utilitiesWifi": $scope.data.utilitiesWifi,
          "utilitiesCable": $scope.data.utilitiesCable,
          "rate": $rootScope.currencyRate,
          "cleanfinalprice": $scope.data.property.cleanfinalprice,
          "cleanprice": $scope.data.property.cleanprice,
          "expires": $scope.data.expires,
          "nights": $scope.data.nights,
          "conditionsAgent": $scope.data.conditionsAgent,
          "conditionsTenant": $scope.data.conditionsTenant,
          "pricePaid": $scope.data.pricePaid,
          "priceReservation": $scope.data.priceReservation,
          "emails": $scope.data.emails
        };

        Booking.update($scope.data.id, booking).then(function () {
          Notification.success({
            message: 'Booking Updated !'
          });
          $state.go('admin.bookings', {}, {
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

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.bookings');
      };

    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.currencies', {
          url: 'currencies/',
          css: '/css/admin.css',
          controller: 'CurrenciesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/currencies/index.html');
          },
          resolve: {
            Currencies: ['Currency', '$q', function (Currency, $q) {
              var d = $q.defer();
              Currency.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            CurrencyData: [function () {
              return false;
            }]
          }
        })
        .state('admin.currencies.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'CurrenciesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/currencies/view.html');
          },
          resolve: {
            CurrencyData: ['Currency', '$q', '$stateParams', function (Currency, $q, $stateParams) {
              var d = $q.defer();
              Currency.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.currencies.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'CurrenciesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/currencies/view.html');
          },
          resolve: {
            CurrencyData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('CurrenciesCtrl', ['Currency', '$stateParams', '$scope', '$state', 'Currencies', 'CurrencyData', 'DTOptionsBuilder', 'Notification', '$timeout', function (Currency, $stateParams, $scope, $state, Currencies, CurrencyData, DTOptionsBuilder, Notification, $timeout) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.currencies = Currencies;
      if (CurrencyData) {
        $scope.currency = CurrencyData;
      } else {
        $scope.currency = {
          active: false,
          default: false
        };
      }

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.delete = function (id) {
        Currency.delete(id).then(function () {
          Notification.success({
            message: 'Currency Deleted'
          });
          $scope.currencies = _.without($scope.currencies, _.findWhere($scope.currencies, {
            id: id
          }));
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

      $scope.update = function () {
        Currency.add($scope.currency).then(function () {
          Notification.success({
            message: 'Currency Modified'
          });
          $state.go('admin.currencies', {}, {
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

      $scope.back = function () {
        $state.go('admin.currencies', {}, {
          reload: true
        });
      };

  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.deals', {
          url: 'deals/',
          css: '/css/admin.css',
          controller: 'DealsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/deals/index.html');
          },
          resolve: {
            Deals: ['HotDeals', '$q', function (HotDeals, $q) {
              var d = $q.defer();
              HotDeals.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            DealData: [function () {
              return false;
            }]
          }
        })
        .state('admin.deals.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'DealsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/deals/view.html');
          },
          resolve: {
            DealData: ['HotDeals', '$q', '$stateParams', function (HotDeals, $q, $stateParams) {
              var d = $q.defer();
              HotDeals.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.deals.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'DealsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/deals/view.html');
          },
          resolve: {
            DealData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('DealsCtrl', ['HotDeals', '$stateParams', '$scope', '$state', 'Deals', 'DealData', 'DTOptionsBuilder', 'Notification', 'Calendar', '$timeout', '$rootScope', 'Modal', 'CONFIG', function (HotDeals, $stateParams, $scope, $state, Deals, DealData, DTOptionsBuilder, Notification, Calendar, $timeout, $rootScope, Modal, CONFIG) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.deals = Deals;
      if (DealData) {
        $scope.deal = DealData;
      } else {
        $scope.deal = {
          active: false,
          hot: false,
          start: moment().unix(),
          end: moment().unix(),
          priceDay: 0,
          priceWeek: 0,
          priceMonth: 0,
          priceYear: 0
        };
      }

      $scope.loadCalendar = function () {
        Calendar.doubleDates('.dealCalendar', 'periodChanged', moment.unix($scope.deal.start).format(CONFIG.DEFAULT_DATE_FORMAT), moment.unix($scope.deal.end).format(CONFIG.DEFAULT_DATE_FORMAT));
      };

      $rootScope.$on("periodChanged", function (event, data) {
        $timeout(function () {
          $scope.deal.start = data.date1;
          $scope.deal.end = data.date2;
        });
      });

      $scope.propertyList = function () {
        Modal.propertyList();
      };

      $rootScope.$on("propertySelected", function (event, property) {
        $scope.deal.property = property;
      });

      $scope.delete = function (id) {
        HotDeals.delete(id).then(function () {
          Notification.success({
            message: 'Deal Deleted'
          });
          $scope.deals = _.without($scope.deals, _.findWhere($scope.deals, {
            id: id
          }));
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

      $scope.update = function () {
        $scope.deal.property = $scope.deal.property.id;
        $scope.deal.start = moment($scope.deal.start, CONFIG.DEFAULT_DATE_FORMAT).unix();
        $scope.deal.end = moment($scope.deal.end, CONFIG.DEFAULT_DATE_FORMAT).unix();
        HotDeals.add($scope.deal).then(function () {
          Notification.success({
            message: 'Deal Modified'
          });
          $state.go('admin.deals', {}, {
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

  }]);
})();
(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('admin.discounts', {
                    url: 'discounts/',
                    css: '/css/admin.css',
                    controller: 'DiscountsCtrl',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/admin/discounts/index.html');
                    },
                    resolve: {
                        Discounts: ['Discount', '$q', function (Discount, $q) {
                            var d = $q.defer();
                            Discount.getAll({
                                details: true
                            }).then(function (data) {
                                d.resolve(data);
                            });

                            return d.promise;
                        }],
                        DiscountData: [function () {
                            return false;
                        }]
                    }
                })
                .state('admin.discounts.view', {
                    url: 'view/:id/',
                    css: '/css/admin.css',
                    controller: 'DiscountsCtrl',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/admin/discounts/view.html');
                    },
                    resolve: {
                        Discounts: [function () {
                            return false;
                        }],
                        DiscountData: ['Discount', '$q', '$stateParams', function (Discount, $q, $stateParams) {
                            var d = $q.defer();
                            Discount.getDetails($stateParams.id).then(function (data) {
                                d.resolve(data);
                            }).catch(function () {
                                d.reject();
                            });
                            return d.promise;
                        }]
                    }
                })
                .state('admin.discounts.add', {
                    url: 'add/',
                    css: '/css/admin.css',
                    controller: 'DiscountsCtrl',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/admin/discounts/view.html');
                    },
                    resolve: {
                        DiscountData: [function () {
                            return false;
                        }]
                    }
                });
        }])
        .controller('DiscountsCtrl', ['Discount', '$stateParams', '$scope', '$state', 'Discounts', 'DiscountData', 'DTOptionsBuilder', 'Notification', 'Modal', '$rootScope', 'CONFIG', 'Calendar', '$timeout', function (Discount, $stateParams, $scope, $state, Discounts, DiscountData, DTOptionsBuilder, Notification, Modal, $rootScope, CONFIG, Calendar, $timeout) {
            $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
            $scope.discounts = Discounts;
            if (DiscountData) {
                $scope.discount = DiscountData;
            } else {
                $scope.discount = {};
            }

            if($scope.discount.expires){
                $scope.expireChanged = new Date($scope.discount.expires);
            }

            $scope.loadCalendarExpire = function () {
                Calendar.singleDate('.discountexpires', 'expireChanged', $scope.discount.expires);
            };


            $scope.$watch('expireChanged', function () {
                console.log($scope.expireChanged);
                $scope.discount.expires = Math.round($scope.expireChanged / 1000);
            });

            $scope.propertyList = function () {
                Modal.propertyList();
            };

            $rootScope.$on("propertySelected", function (event, property) {
                $scope.discount.property = property;
            });

            $scope.tenantList = function () {
                Modal.tenantList();
            };

            $rootScope.$on("tenantSelected", function (event, tenant) {
                $scope.discount.user = tenant;
            });

            $scope.delete = function (id) {
                Discount.delete(id).then(function () {
                    Notification.success({
                        message: 'Discount Deleted'
                    });
                    $scope.discounts = _.without($scope.discounts, _.findWhere($scope.discounts, {
                        id: id
                    }));
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

            $scope.update = function () {
                $scope.discount.property = $scope.discount.property.id;
                $scope.discount.user = $scope.discount.user.id;
                Discount.add($scope.discount).then(function () {
                    Notification.success({
                        message: 'Discounts Modified'
                    });
                    $state.go('admin.discounts', {}, {
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

            $timeout(function () {
                $('.inittable').click();
            }, 500);

            $scope.back = function () {
                $state.go('admin.discounts');
            };

        }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.emailVariables', {
          url: 'emailVariables/',
          css: '/css/admin.css',
          controller: 'EmailVaraiblesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/emailVariables/index.html');
          }
        })
      }])
    .controller('EmailVaraiblesCtrl', ['$stateParams', '$scope', '$state', 'Notification', '$rootScope', 'CONFIG', '$timeout', '$http',
     function ($stateParams, $scope, $state, Notification, $rootScope, CONFIG, $timeout, $http) {
             $http.get(CONFIG.HELPER_URL + '/emailVariable/getVariablesForAdmin/', {
                headers: {'Content-Type': 'application/json'}
              }).then(function(result){
               console.log("VARIABLES", result.data.data);
               $scope.variables = result.data.data;
               $scope.updateStatus = false;
               $scope.actionStatus = true;
               $scope.bufferClean = function(){
                 $scope.variable = {
                   func:"",
                   condition:"",
                   variable:"",
                   default:""
                 };
                 $scope.currentId = '';
               }
               $scope.bufferClean();
               $scope.toggleActionStatus = function(){
                 $scope.actionStatus = !$scope.actionStatus;
               }
               $scope.editVariable = function(id){
                 var currentVariable = $scope.variables.filter(function(obj){
                   return obj._id == id;
                 });
                 currentVariable = currentVariable[0];
                 $scope.variable.variable = currentVariable.variable;
                 $scope.variable.func = currentVariable.func;
                 $scope.variable.condition = currentVariable.condition;
                 $scope.variable.default = currentVariable.default;
                 $scope.currentId = currentVariable._id;
                 $scope.updateStatus = true;
                 $scope.toggleActionStatus();
               }

               $scope.cancel = function(){
                 $scope.toggleActionStatus();
                 $scope.bufferClean();
                 $scope.updateStatus = false;
               }

               $scope.delete = function(id){
                 $http.get(CONFIG.HELPER_URL + '/emailVariable/deleteVariable/' + id, {
                    headers: {'Content-Type': 'application/json'}
                  }).then(function(result){
                    if(!result.data.error){
                      $scope.variables = $scope.variables.filter(function(obj){
                        return obj._id != id;
                      });
                    }
                  });
               };

               $scope.saveVariable = function(){
                 if(!$scope.updateStatus){
                   $http.post(CONFIG.HELPER_URL + '/emailVariable/addVariable/',{
                     func:$scope.variable.func,
                     condition:$scope.variable.condition,
                     variable:$scope.variable.variable,
                     default:$scope.variable.default
                   }, {
                      headers: {'Content-Type': 'application/json'}
                    }).then(function(result){
                      console.log(result);
                      $scope.variables.push(result.data.data);
                      $scope.toggleActionStatus();
                      $scope.bufferClean();
                    });
                 }else{
                   $http.post(CONFIG.HELPER_URL + '/emailVariable/updateVariable/' + $scope.currentId,{
                     func:$scope.variable.func,
                     condition:$scope.variable.condition,
                     variable:$scope.variable.variable,
                     default:$scope.variable.default
                   }, {
                      headers: {'Content-Type': 'application/json'}
                    }).then(function(result){
                      console.log(result);
                      for(var i = 0; i < $scope.variables.length; i++){
                        if($scope.variables[i]._id == result.data.data._id){
                          $scope.variables[i] = result.data.data;
                        }
                      }
                      $scope.toggleActionStatus();
                      $scope.bufferClean();
                      $scope.updateStatus = false;
                    });
                 }
               };


             });
  }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.emails', {
          url: 'emails/',
          css: '/css/admin.css',
          controller: 'EmailsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/emails/index.html');
          },
          resolve: {
            Emails: ['Email', '$q', function (Email, $q) {
              var d = $q.defer();
              Email.list().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            EmailData: function () {
              return {};
            }
          }
        })
        .state('admin.emails.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'EmailsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/emails/view.html');
          },
          resolve: {
            Emails: function () {
              return [];
            },
            EmailData: ['$http', '$q', '$stateParams', 'CONFIG', function ($http, $q, $stateParams, CONFIG) {
              var d = $q.defer();
              $http.get(CONFIG.API_URL + '/emails/', {
                params: {
                  value: $stateParams.id
                }
              }).then(function (data) {
                d.resolve(data.data[0]);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.emails.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'EmailsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/emails/view.html');
          },
          resolve: {
            Emails: function () {
              return [];
            },
            EmailData: function () {
              return {};
            }
          }
        })
		.state('admin.emails.signature', {      // 2016-05-17 - Ajay - Create link in admin emails page for update default signature
          url: 'signature/',
          css: '/css/admin.css',
          controller: 'EmailsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/emails/signature.html');
          },
          resolve: {
            Emails: function () {
              return [];
            },
            EmailData: ['$http', '$q', '$stateParams', 'CONFIG', function ($http, $q, $stateParams, CONFIG) {
              var d = $q.defer();
              $http.get(CONFIG.API_URL + '/emails/', {
                params: {
                  value: 'signature'
                }
              }).then(function (data) {
                d.resolve(data.data[0]);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
			}]
          }
        });
      }])
    .controller('EmailsCtrl', ['Emails', '$stateParams', '$scope', '$state', 'Email', 'EmailData', 'DTOptionsBuilder', 'Notification', 'Modal', '$rootScope', 'CONFIG', 'Calendar', '$timeout', '$http', function (Emails, $stateParams, $scope, $state, Email, EmailData, DTOptionsBuilder, Notification, Modal, $rootScope, CONFIG, Calendar, $timeout, $http) {
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.emails = Emails;

      $scope.email = EmailData;

      $scope.viewTags = function () {
        Modal.tags();
      };

      $scope.delete = function (id) {
        $http.delete(CONFIG.API_URL + '/emails/' + id).then(function () {
          Notification.success({
            message: 'Email Deleted'
          });
          $scope.emails = _.without($scope.emails, _.findWhere($scope.emails, {
            id: id
          }));
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

      $scope.update = function () {
        var data = $scope.email;
        $http.post(CONFIG.API_URL + '/emails', data).then(function () {
          Notification.success({
            message: 'Email Modified'
          });
          $state.go('admin.emails', {}, {
            reload: true
          });
        }).catch(function (err) {
          if (err.data && err.data.errors) {
            var formattedError = '';
            _.mapObject(err.data.errors, function (v, k) {
              formattedError += '<p class="format_error"><b>' + k + '</b> - ' + v + '</p>';
            });
            Notification.error({
              message: formattedError
            });
          } else {
            Notification.error({
              message: JSON.stringify(err.data)
            });
          }
        });
      };
		 
		$scope._signature = '';
		if($scope.email!=undefined && $scope.email.value!=undefined && $scope.email.value=='signature'){
			$scope._signature = $scope.email.html;
		}
		$scope.changeSignature = function () {			
			if($scope.email==undefined){
				var data = {"name":"Default Signature","value":"signature","html":$scope._signature};
				$http.post(CONFIG.API_URL + '/emails', data).then(function () {
				  Notification.success({
					message: 'Signature Modified!'
				  });
				  $state.go('admin.emails.signature', {}, {
					reload: true
				  });
				}).catch(function (err) {
				  if (err.data && err.data.errors) {
					var formattedError = '';
					_.mapObject(err.data.errors, function (v, k) {
					  formattedError += '<p class="format_error"><b>' + k + '</b> - ' + v + '</p>';
					});
					Notification.error({
					  message: formattedError
					});
				  } else {
					Notification.error({
					  message: JSON.stringify(err.data)
					});
				  }
				});
			}else{
				var data = {"html":$scope._signature};
				$http.post(CONFIG.API_URL + '/emails/'+$scope.email.id, data).then(function () {
				  Notification.success({
					message: 'Signature Modified!'
				  });
				  $state.go('admin.emails.signature', {}, {
					reload: true
				  });
				}).catch(function (err) {
				  if (err.data && err.data.errors) {
					var formattedError = '';
					_.mapObject(err.data.errors, function (v, k) {
					  formattedError += '<p class="format_error"><b>' + k + '</b> - ' + v + '</p>';
					});
					Notification.error({
					  message: formattedError
					});
				  } else {
					Notification.error({
					  message: JSON.stringify(err.data)
					});
				  }
				});
			}
		  };

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.emails', {}, {
          reload: true
        });
      };

  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin', {
          url: '/admin/',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/home/index.html');
          },
          controller: ["$state", "$rootScope", function ($state, $rootScope) {
            if ($state.current.name === 'admin') {
              if ($rootScope.admin.type === 'admin') return $state.go('admin.home');
              if ($rootScope.admin.type === 'translator') $state.go('admin.site-translations');
            }
            //Loads the correct sidebar on window load,
            //collapses the sidebar on window resize.
            // Sets the min-height of #page-wrapper to window size
            $(function () {
              $('#side-menu').metisMenu();
              $(window).bind("load resize", function () {
                var topOffset = 50;
                var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
                if (width < 768) {
                  $('div.navbar-collapse').addClass('collapse');
                  topOffset = 100; // 2-row-menu
                } else {
                  $('div.navbar-collapse').removeClass('collapse');
                }

                var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
                height = height - topOffset;
                if (height < 1) height = 1;
                if (height > topOffset) {
                  $("#page-wrapper").css("min-height", (height) + "px");
                }
              });

              var url = window.location;
              var element = $('ul.nav a').filter(function () {
                return this.href == url || url.href.indexOf(this.href) == 0;
              }).addClass('active').parent().parent().addClass('in').parent();
              if (element.is('li')) {
                element.addClass('active');
              }
            });
          }],
          resolve: {
            Admin: ['Auth', '$q', '$state', '$rootScope', function (Auth, $q, $state, $rootScope) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {

                if (data.data.type === 'admin') {
                  $rootScope.admin = data.data;
                  d.resolve(data);
                } else if (data.data.type === 'translator') {
                  $rootScope.admin = data.data;
                  d.resolve(data);
                } else {
                  $state.go('admin_login');
                  d.reject();
                }
              }).catch(function () {
                $state.go('admin_login');
                d.reject();
              });

              return d.promise;
          }]
          }
        })
        .state('admin.home', {
          url: 'home/',
          css: '/css/admin.css',
          controller: 'AdminHomeCtrl',
          title: 'title_admin_home',
          template: ''
        });
    }])
    .controller('AdminHomeCtrl', [function () {


  }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.languages', {
          url: 'languages/',
          css: '/css/admin.css',
          controller: 'LanguagesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/languages/index.html');
          },
          resolve: {
            Languages: ['Language', '$q', function (Language, $q) {
              var d = $q.defer();
              Language.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            LanguageData: [function () {
              return false;
            }]
          }
        })
        .state('admin.languages.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'LanguagesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/languages/view.html');
          },
          resolve: {
            LanguageData: ['Language', '$q', '$stateParams', function (Language, $q, $stateParams) {
              var d = $q.defer();
              Language.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.languages.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'LanguagesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/languages/view.html');
          },
          resolve: {
            LanguageData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('LanguagesCtrl', ['Language', '$stateParams', '$scope', '$state', 'Languages', 'LanguageData', 'DTOptionsBuilder', 'Notification', '$timeout', function (Language, $stateParams, $scope, $state, Languages, LanguageData, DTOptionsBuilder, Notification, $timeout) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.languages = Languages;
      if (LanguageData) {
        $scope.language = LanguageData;
      } else {
        $scope.language = {
          active: false,
          default: false
        };
      }

      $scope.delete = function (id) {
        Language.delete(id).then(function () {
          Notification.success({
            message: 'Language Deleted'
          });
          $scope.languages = _.without($scope.languages, _.findWhere($scope.languages, {
            id: id
          }));
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

      $scope.update = function () {
        Language.add($scope.language).then(function () {
          Notification.success({
            message: 'Language Modified'
          });
          $state.go('admin.languages', {}, {
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

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.languages');
      };

  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.locations', {
          url: 'locations/',
          css: '/css/admin.css',
          controller: 'LocationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/locations/index.html');
          },
          resolve: {
            Locations: ['Location', '$q', function (Location, $q) {
              var d = $q.defer();
              Location.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            LocationData: [function () {
              return false;
            }]
          }
        })
        .state('admin.locations.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'LocationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/locations/view.html');
          },
          resolve: {
            LocationData: ['Location', '$q', '$stateParams', function (Location, $q, $stateParams) {
              var d = $q.defer();
              Location.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.locations.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'LocationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/locations/view.html');
          },
          resolve: {
            LocationData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('LocationsCtrl', ['Location', '$stateParams', '$scope', '$state', 'Locations', 'LocationData', 'DTOptionsBuilder', 'Notification', '$timeout', function (Location, $stateParams, $scope, $state, Locations, LocationData, DTOptionsBuilder, Notification, $timeout) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.locations = Locations;
      if (LocationData) {
        $scope.location = LocationData;
      } else {
        $scope.location = {};
      }

      $scope.delete = function (id) {
        Location.delete(id).then(function () {
          Notification.success({
            message: 'Location Deleted'
          });
          $scope.locations = _.without($scope.locations, _.findWhere($scope.locations, {
            id: id
          }));
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

      $scope.update = function () {
        Location.add($scope.location).then(function () {
          Notification.success({
            message: 'Location Modified'
          });
          $state.go('admin.locations', {}, {
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

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.locations', {}, {
          reload: true
        });
      };

  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin_login', {
          controller: 'AdminLoginCtrl',
          url: '/admin/login/',
          title: 'title_admin_login',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/login/index.html');
          },
          resolve: {
            Admin: ['Auth', '$q', '$state', function (Auth, $q, $state) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {
                if (data.data.type === 'admin') {
                  $state.go('admin.home');
                  d.resolve(data);
                } else if (data.data.type === 'translator') {
                  $state.go('admin.site-translations');
                  d.resolve(data);
                } else {
                  d.resolve();
                }
              }).catch(function () {
                d.reject();
              });

              return d.promise;
          }]
          }
        })
        .state('admin_logout', {
          url: '/admin/logout/',
          resolve: {
            Logout: ['Auth', '$q', '$state', function (Auth, $q, $state) {
              var d = $q.defer();
              Auth.logout().then(function () {
                $state.go('admin_login', {}, {
                  reload: true
                });
                d.resolve();
              }).catch(function () {
                $state.go('admin_login', {}, {
                  reload: true
                });
                d.resolve();
              });

              return d.promise;
          }]
          }
        });
    }])
    .controller('AdminLoginCtrl', ['$scope', '$stateParams', 'Auth', '$state', function ($scope, $stateParams, Auth, $state) {
      $scope.to = 'management';
      $scope.login = function (e, p, t) {
        
        $scope.$error = false;
        Auth.loginAdmin(e, p).then(function (data) {
          if(data.type === 'translator') return $state.go('admin.site-translations');
          $state.go(t + '.home');
        }).catch(function () {
          $scope.$error = true;
        });
      };

  }]);
})();
/**
* 2016-05-17 - Ajay
* MessagesCtrl - Controller for Messages Page at admin
* Where Admin can delete all messages
**/
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.messages', {
          url: 'messages/',
          css: '/css/admin.css',
          controller: 'MessagesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/messages/index.html');
          },
          resolve: {
            Messages: ['Contact', '$q', function (Contact, $q) {
				var d = $q.defer();
				Contact.getAllMessages().then(function (data) {
					d.resolve(data);
				});
				return d.promise;
            }]
          }
        });
    }])
    .controller('MessagesCtrl', ['$scope', '$state', '$rootScope', 'Modal', 'Calendar', '$timeout', '$http', 'CONFIG', 'Notification', 'Property', 'Locale', 'Messages', 'DTOptionsBuilder','vcRecaptchaService','Contact', function ($scope, $state, $rootScope, Modal, Calendar, $timeout, $http, CONFIG, Notification, Property, Locale, Messages, DTOptionsBuilder,vcRecaptchaService,Contact) {
		$scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
		$scope.messages = Messages;
	  
	  /*** SYN- For Delete All Bookings ***/
		
		$scope.publicKey = CONFIG.PUBLIC_KEY;
		$scope.selected = {};
		$scope.selectAll = false;
		$scope.disabled = true;
	
		$scope.toggleAll = toggleAll;
		$scope.toggleOne = toggleOne;
	  
		function toggleAll (selectAll, selectedItems) {
			for (var id in selectedItems) {
				if (selectedItems.hasOwnProperty(id)) {
					selectedItems[id] = selectAll;
				}
			}			
		}
		function toggleOne (selectedItems) {
			for (var id in selectedItems) {
				if (selectedItems.hasOwnProperty(id)) {
					if(!selectedItems[id]) {
						$scope.selectAll = false;
						return;
					}
				}
			}
			$scope.selectAll = true;
		}
		
		angular.forEach(Messages, function(m){
			$scope.selected[m.id] = false;
		});
		
		 $scope.verifyCallback = function(response){
			$scope.disabled = false;
		};
		
		 $scope.expiredCallback = function(response) {
			$scope.disabled = true;
		};
	  
		$scope.deleteSelected = function (deleteStatus) {
			if(vcRecaptchaService.getResponse() === ""){
				alert("Please resolve the captcha and delete message!")
			}else{
				if(deleteStatus){
					$(".page-loading").removeClass("hide");	
					var data = {'Event':'DELETE', 'Type':'All', 'Collection':'message'};
					Contact.deleteAllMessage(data).then(function(){
						Notification.success({
							message: 'All Messages Deleted !'
						});
						$state.go('admin.messages', {}, {
							reload: true
						});
					}).catch(function (err) {
						if (err.data && err.data.errors) {
							Notification.error({
								message: JSON.stringify(err.data.errors)
							});
							 $(".page-loading").addClass("hide");
						} else {
							Notification.error({
								message: JSON.stringify(err.data)
							});
							 $(".page-loading").addClass("hide");
						}
					});
				}else{	
					var ids = [];
					 $(".page-loading").removeClass("hide");	
					angular.forEach($scope.selected, function(status,id){
						if(status==true){
							ids.push(id);
						}						
					});
					if(ids.length>0){
						var data = {'Event':'DELETE', 'Type':'Selected', 'ids':ids, 'Collection':'message'};
						Contact.deleteAllMessage(data).then(function () {
							Notification.success({
								message: 'Selected Messages Deleted !'
							});
							$state.go('admin.messages', {}, {
								reload: true
							});
						}).catch(function (err) {
							if (err.data && err.data.errors) {
								Notification.error({
									message: JSON.stringify(err.data.errors)
								});
								 $(".page-loading").addClass("hide");
							}else{
								Notification.error({
									message: JSON.stringify(err.data)
								});
								 $(".page-loading").addClass("hide");
							}
						});
					}else{
						alert("Please select message for delete!");
						$(".page-loading").addClass("hide");						
					}			
				}				
			}
		};
		
		/*** For Checkbox End ***/

      $scope.messages = Messages;

      $scope.delete = function (id) {
        Contact.delete(id).then(function () {
          Notification.success({
            message: 'Message Deleted !'
          });
          $state.go('admin.messages', {}, {
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
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.news', {
          url: 'news/',
          css: '/css/admin.css',
          controller: 'NewsICtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/news/index.html');
          },
          resolve: {
            AllNews: ['News', '$q', function (News, $q) {
              var d = $q.defer();
              News.getAll().then(function (data) {
                d.resolve(data);
              });
              return d.promise;
          }],
            NewsData: [function () {
              return false;
            }]
          }
        })
        .state('admin.news.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'NewsICtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/news/view.html');
          },
          resolve: {
            NewsData: ['News', '$q', '$stateParams', function (News, $q, $stateParams) {
              var d = $q.defer();
              News.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.news.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'NewsICtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/news/view.html');
          },
          resolve: {
            NewsData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('NewsICtrl', ['News', 'AllNews', '$stateParams', '$scope', '$state', 'NewsData', 'Notification', 'Calendar', '$rootScope', '$timeout', 'DTOptionsBuilder', function (News, AllNews, $stateParams, $scope, $state, NewsData, Notification, Calendar, $rootScope, $timeout, DTOptionsBuilder) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.allNews = AllNews;
      if (NewsData) {
        $scope.new = NewsData;
      } else {
        $scope.new = {

        };
      }

      $scope.loadCalendar = function () {
        Calendar.doubleDates('.periodPeriod', 'periodChanged2', $scope.new.start, $scope.new.end, 'X');
      };

      $rootScope.$on("periodChanged2", function (event, data) {
        $timeout(function () {
          $scope.new.start = data.date1;
          $scope.new.end = data.date2;
        });
      });

      $scope.delete = function (id) {
        News.delete(id).then(function () {
          Notification.success({
            message: 'News Deleted'
          });
          $scope.news = _.without($scope.news, _.findWhere($scope.news, {
            id: id
          }));
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

      $scope.update = function () {
        News.add($scope.new).then(function () {
          Notification.success({
            message: 'News Modified'
          });
          $state.go('admin.news', {}, {
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

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.news');
      };

  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.periods', {
          url: 'periods/',
          css: '/css/admin.css',
          controller: 'PeriodsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/periods/index.html');
          },
          resolve: {
            Periods: ['Period', '$q', function (Period, $q) {
              var d = $q.defer();
              Period.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            PeriodData: [function () {
              return false;
            }]
          }
        })
        .state('admin.periods.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'PeriodsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/periods/view.html');
          },
          resolve: {
            PeriodData: ['Period', '$q', '$stateParams', function (Period, $q, $stateParams) {
              var d = $q.defer();
              Period.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.periods.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'PeriodsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/periods/view.html');
          },
          resolve: {
            PeriodData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('PeriodsCtrl', ['Period', '$stateParams', '$scope', '$state', 'Periods', 'PeriodData', 'DTOptionsBuilder', 'Notification', 'Calendar', '$rootScope', '$timeout', 'Modal', function (Period, $stateParams, $scope, $state, Periods, PeriodData, DTOptionsBuilder, Notification, Calendar, $rootScope, $timeout, Modal) {
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.periods = Periods;
      if (PeriodData) {
        $scope.period = PeriodData;
      } else {
        $scope.period = {};
      }

      $scope.loadCalendar = function () {
        Calendar.doubleDates('.periodPeriod', 'periodChanged', $scope.period.from, $scope.period.to, 'D-M');
      };

      $rootScope.$on("periodChanged", function (event, data) {
        $timeout(function () {
          $scope.period.from = data.date1;
          $scope.period.to = data.date2;
        });
      });

      $scope.seasonList = function () {
        Modal.seasonList();
      };

      $rootScope.$on("seasonSelected", function (event, season) {
        $scope.period.season = season;
      });

      $scope.delete = function (id) {
        Period.delete(id).then(function () {
          Notification.success({
            message: 'Period Deleted'
          });
          $scope.periods = _.without($scope.periods, _.findWhere($scope.periods, {
            id: id
          }));
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

      $scope.update = function () {
        Period.add($scope.period).then(function () {
          Notification.success({
            message: 'Period Modified'
          });
          $state.go('admin.periods', {}, {
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

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.periods');
      };
  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.prices', {
          url: 'prices/',
          css: '/css/admin.css',
          controller: 'PricesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/prices/index.html');
          },
          resolve: {
            Prices: ['Price', '$q', function (Price, $q) {
              var d = $q.defer();
              Price.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            PriceData: [function () {
              return false;
            }]
          }
        })
        .state('admin.prices.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'PricesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/prices/view.html');
          },
          resolve: {
            PriceData: ['Price', '$q', '$stateParams', function (Price, $q, $stateParams) {
              var d = $q.defer();
              Price.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.prices.add', {
          url: 'prices/add/',
          css: '/css/admin.css',
          controller: 'PricesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/prices/view.html');
          },
          resolve: {
            PriceData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('PricesCtrl', ['Price', '$stateParams', '$scope', '$state', 'Prices', 'PriceData', 'DTOptionsBuilder', 'Notification', 'Modal', '$rootScope', '$timeout', function (Price, $stateParams, $scope, $state, Prices, PriceData, DTOptionsBuilder, Notification, Modal, $rootScope, $timeout) {
      $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
          if (fn && (typeof (fn) === 'function')) {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      };
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.prices = Prices;
      if (PriceData) {
        $scope.price = PriceData;
      } else {
        $scope.price = {
          priceDay: 0,
          priceWeek: 0,
          priceMonth: 0,
          priceYear: 0,
          commissionDay: 0,
          commissionWeek: 0,
          commissionMonth: 0,
          commissionYear: 0,
          depositDay: 0,
          depositWeek: 0,
          depositMonth: 0,
          depositYear: 0,
          priceWeekend: 0
        };
      }

      $scope.startWatch = function () {
        setTimeout(function () {
          $('form[name="editableForm"]').find('input.editable-input').keyup(function () {
            var model = $(this).prop('name');
            var value = this.value;
            $scope.$apply(function () {
              $scope.price[model] = value;
            });

          });
        }, 500);
      };

      $scope.stopWatch = function () {
        $('form[name="editableForm"]').find('input.editable-input').unbind();
      };

      $scope.propertyList = function () {
        Modal.propertyList();
      };

      $rootScope.$on("propertySelected", function (event, property) {
        $scope.price.property = property;
      });

      $scope.seasonList = function () {
        Modal.seasonList();
      };

      $rootScope.$on("seasonSelected", function (event, season) {
        $scope.price.season = season;
      });

      $scope.delete = function (id) {
        Price.delete(id).then(function () {
          Notification.success({
            message: 'Price Deleted'
          });
          $scope.prices = _.without($scope.prices, _.findWhere($scope.prices, {
            id: id
          }));
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

      $scope.update = function () {
        $scope.price.property = $scope.price.property.id;
        if (!$scope.price.created) {
          $scope.price.created = moment().unix();
        }
        Price.add($scope.price).then(function () {
          Notification.success({
            message: 'Price Modified'
          });
          $state.go('admin.prices');
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

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.prices');
      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.properties', {
          url: 'properties/',
          css: '/css/admin.css',
          controller: 'PropertiesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/properties/index.html');
          },
          resolve: {
            Properties: ['Property', '$q', function (Property, $q) {
              var d = $q.defer();
              Property.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            PropertyData: [function () {
              return false;
            }]
          }
        })
        .state('admin.properties.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'PropertiesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/properties/view.html');
          },
          resolve: {
            PropertyData: ['Property', '$q', '$stateParams', function (Property, $q, $stateParams) {
              var d = $q.defer();
              Property.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.properties.add', {
          url: 'properties/add/',
          css: '/css/admin.css',
          controller: 'PropertiesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/properties/view.html');
          },
          resolve: {
            PropertyData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('PropertiesCtrl', ['Property', '$stateParams', '$scope', '$state', 'Properties', 'PropertyData', 'DTOptionsBuilder', 'Notification', 'FileUploader', 'CONFIG', 'Modal', '$rootScope', function (Property, $stateParams, $scope, $state, Properties, PropertyData, DTOptionsBuilder, Notification, FileUploader, CONFIG, Modal, $rootScope) {
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.dtOptions.iDisplayStart = 20;
      $scope.properties = Properties;
      if (PropertyData) {
        $scope.property = PropertyData.data.property;
        $scope.imagesList = $scope.property.images;
      } else {
        $scope.property = {
          active: false,
          location: {}
        };
      }
      $scope.updateImageOrder = function () {
        $scope.property.images = $scope.imagesList;
        $scope.update(true);
      };

      var uploader = $scope.uploader = new FileUploader({
        url: CONFIG.API_URL + '/propertyimage',
        queueLimit: 1,
        formData: [{
          "unique": $scope.property.unique,
          "id": $scope.property.id
        }],
      });

      uploader.onBeforeUploadItem = function (item) {
        Notification.success({
          message: item._file.name + ' is uploading...'
        });
      };

      // FILTERS
      uploader.filters.push({
        removeAfterUpload: false,
        name: 'imageFilter',
        fn: function (item /*{File|FileLikeObject}*/ , options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|'.indexOf(type) !== -1;
        }
      });

      uploader.onSuccessItem = function (item, response, status, headers) {
        if (response && response.success && response.filename) {
          $scope.property.images.push(response.filename);
          uploader.removeFromQueue(item);
          Notification.success({
            message: 'Upload Completed!'
          });
        }
      };

      $scope.deleteImg = function (image) {
        $scope.property.images = _.without($scope.property.images, image);
      };

      $scope.featuredImg = function (image) {
        $scope.property.featured = image;
      };

      $scope.locationList = function () {
        Modal.locationList();
      };

      $rootScope.$on("locationSelected", function (event, location) {
        $scope.property.location = location;
      });

      $scope.delete = function (id) {
        Property.delete(id).then(function () {
          Notification.success({
            message: 'Property Deleted'
          });
          $scope.properties = _.without($scope.properties, _.findWhere($scope.properties, {
            id: id
          }));
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

      $scope.update = function (redirect) {
        Property.add($scope.property).then(function () {
          Notification.success({
            message: 'Property Modified'
          });
          if (!redirect) {
            $state.go('admin.properties', {}, {
              reload: true
            });
          }
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

  }])
    .directive('ngThumb', ['$window', function ($window) {
      var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function (item) {
          return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function (file) {
          var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      };

      return {
        restrict: 'A',
        template: '<canvas/>',
        link: function (scope, element, attributes) {
          if (!helper.support) return;

          var params = scope.$eval(attributes.ngThumb);

          if (!helper.isFile(params.file)) return;
          if (!helper.isImage(params.file)) return;

          var canvas = element.find('canvas');
          var reader = new FileReader();

          reader.onload = onLoadFile;
          reader.readAsDataURL(params.file);

          function onLoadFile(event) {
            var img = new Image();
            img.onload = onLoadImage;
            img.src = event.target.result;
          }

          function onLoadImage() {
            var width = params.width || this.width / this.height * params.height;
            var height = params.height || this.height / this.width * params.width;
            canvas.attr({
              width: width,
              height: height
            });
            canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
          }
        }
      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.ratings', {
          url: 'ratings/',
          css: '/css/admin.css',
          controller: 'RatingsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/ratings/index.html');
          },
          resolve: {
            Ratings: ['Rating', '$q', function (Rating, $q) {
              var d = $q.defer();
              Rating.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            RatingData: [function () {
              return false;
            }]
          }
        })
        .state('admin.ratings.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'RatingsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/ratings/view.html');
          },
          resolve: {
            RatingData: ['Rating', '$q', '$stateParams', function (Rating, $q, $stateParams) {
              var d = $q.defer();
              Rating.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        });
    }])
    .controller('RatingsCtrl', ['Rating', '$stateParams', '$scope', '$state', 'Ratings', 'RatingData', 'DTOptionsBuilder', 'Notification', 'Modal', '$rootScope', 'Calendar', '$timeout', function (Rating, $stateParams, $scope, $state, Ratings, RatingData, DTOptionsBuilder, Notification, Modal, $rootScope, Calendar, $timeout) {
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.ratings = Ratings;
      if (RatingData) {
        $scope.rating = RatingData;
      } else {
        $scope.rating = {
          ratings: [3, 3, 3],
          active: false
        };
      }

      $scope.loadCalendarDate = function () {
        Calendar.singleDate('.ratingdate', 'dateChanged', $scope.rating.date);
      };

      $rootScope.$on("dateChanged", function (event, date) {
        $timeout(function () {
          $scope.rating.date = date;
        });
      });

      $scope.delete = function (id) {
        Rating.delete(id).then(function () {
          Notification.success({
            message: 'Rating Deleted'
          });
          $scope.ratings = _.without($scope.ratings, _.findWhere($scope.ratings, {
            id: id
          }));
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

      $scope.update = function () {
        $scope.rating.avgRating = Math.round((parseInt($scope.rating.ratings[0]) + parseInt($scope.rating.ratings[1]) + parseInt($scope.rating.ratings[2])) / 3 * 2) / 2;
        Rating.add($scope.rating).then(function () {
          Notification.success({
            message: 'Rating Modified'
          });
          $state.go('admin.ratings', {}, {
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

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.ratings');
      };

  }]);
})();
(function () {
  "use strict";
  angular.module('ThaiHome')
    .directive("adminSidebar", ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        controller: 'AdminSidebarCtrl',
        template: function () {
          return $templateCache.get('templates/admin/sidebar/index.html');
        }
      };
	}])
    .directive("adminHeader", ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        //controller: 'AdminHeaderCtrl',
        template: function () {
          return $templateCache.get('templates/admin/header/index.html');
        }
      };
	}])
    .controller('AdminSidebarCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {

      var items = [
        {
          name: 'Dashboard',
          icon: 'fa-dashboard',
          sref: 'admin.home',
          childs: [
          ]
        },
        {
          name: 'Users',
          icon: 'fa-user-md',
          sref: 'admin.users',
          childs: [
          ]
        },
        {
          name: 'News',
          icon: 'fa-file-o',
          sref: 'admin.news',
          childs: [
          ]
        },
        {
          name: 'Emails',
          icon: 'fa-envelope-o',
          sref: 'admin.emails',
          childs: [
          ]
        },
		{                      // 2016-05-17 - Ajay - Add Messages menu in admin backend Ajay  lavt qunem!!!
          name: 'Messages',
          icon: 'fa-weixin',
          sref: 'admin.messages',
          childs: [
          ]
        },
        {
          name: 'Languages',
          icon: 'fa-flag',
          sref: 'admin.languages',
          childs: [
          ]
        },
        {
          name: 'Inspection',
          icon: 'fa-check-square',
          sref: 'admin.inspection',
          childs: [
          ]
        },
        {
          name: 'Bookings',
          icon: 'fa-euro',
          sref: 'admin.bookings',
          childs: [
          ]
        },
        {
          name: 'Currencies',
          icon: 'fa-euro',
          sref: 'admin.currencies',
          childs: [
          ]
        },
        {
          name: 'Email Variables',
          icon: 'fa-code',
          sref: 'admin.emailVariables',
          childs: [
          ]
        },
        {
          name: 'Discounts',
          icon: 'fa-tag',
          sref: 'admin.discounts',
          childs: [
          ]
        },
        {
          name: 'Deals',
          icon: 'fa-money',
          sref: 'admin.deals',
          childs: [
          ]
        },
        {
          name: 'Translations',
          icon: 'fa-flag',
          sref: '.',
          childs: [
            {
              name: 'Translations',
              icon: 'fa-flag',
              sref: 'admin.site-translations'
            },
            {
              name: 'Properties',
              icon: 'fa-flag',
              sref: 'admin.property-translations'
            }
          ]
        },
        {
          name: 'Properties',
          icon: 'fa-building',
          sref: 'admin.properties',
          childs: [
            {
              name: 'List',
              icon: 'fa-building',
              sref: 'admin.properties'
            },
            {
              name: 'Add',
              icon: 'fa-building',
              sref: 'admin.properties.add'
            },
            {
              name: 'Prices',
              icon: 'fa-building',
              sref: 'admin.prices'
            },
            {
              name: 'Ratings',
              icon: 'fa-star',
              sref: 'admin.ratings'
            },
            {
              name: 'Locations',
              icon: 'fa-location-arrow',
              sref: 'admin.locations'
            }

          ]
        },
        {
          name: 'Periods',
          icon: 'fa-calendar',
          sref: 'admin.periods',
          childs: [
          ]
        }
      ];

      if ($rootScope.admin.type === 'translator') {
        items = [{
          name: 'Translations',
          icon: 'fa-flag',
          sref: '.',
          childs: [
            {
              name: 'Translations',
              icon: 'fa-flag',
              sref: 'admin.site-translations'
            },
            {
              name: 'Properties',
              icon: 'fa-flag',
              sref: 'admin.property-translations'
            }
          ]
        }];
      }

      $scope.items = items;

  }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.site-translations', {
          url: 'translations/',
          css: '/css/admin.css',
          controller: 'TranslationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/translations/index.html');
          },
          resolve: {
            Translations: ['Language', '$q', 'Auth', function (Language, $q, Auth) {
              var d = $q.defer();
              var query = {};
              Auth.checkLogged().then(function (data) {
                if (data.data.type === 'translator') {
                  query.shortname = {
                    $in: data.data.languages
                  };
                }
                Language.getAll(query).then(function (data) {
                  d.resolve(data);
                });
              });


              return d.promise;
            }],
            TranslationData: function () {
              return false;
            },
            TranslationDef: function () {
              return false;
            }
          }
        })
        .state('admin.site-translations.edit', {
          url: 'edit/:shortname/',
          css: '/css/admin.css',
          controller: 'TranslationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/translations/view.html');
          },
          resolve: {
            TranslationData: ['$q', '$http', '$stateParams', function ($q, $http, $stateParams) {
              var d = $q.defer();
              $http.get('/translations/' + $stateParams.shortname + '.json').then(function (data) {
                d.resolve(data.data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
            }],
            TranslationDef: ['$q', '$http', '$stateParams', 'CONFIG', function ($q, $http, $stateParams, CONFIG) {
              var d = $q.defer();
              var lng = '';
              if(localStorage.getItem('locale')){
                lng = localStorage.getItem('locale');
              }else{
                lng = CONFIG.DEFAULT_LANGUAGE;
              }
              $http.get('/translations/' + lng + '.json').then(function (data) {
                d.resolve(data.data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
            }]
          }
        })
        .state('admin.property-translations', {
          url: 'translations/property/',
          css: '/css/admin.css',
          controller: 'PropertyTranslationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/translations/property-index.html');
          },
          resolve: {
            Translations: ['Translation', '$q', 'Auth', function (Translation, $q, Auth) {
              var d = $q.defer();

              var query = {};
              Auth.checkLogged().then(function (data) {
                if (data.data.type === 'translator') {
                  query.language = {
                    $in: data.data.languages
                  };
                }
                Translation.getAll(query).then(function (data) {
                  d.resolve(data);
                });
              });
              return d.promise;
            }],
            TranslationData: function () {
              return false;
            }
          }
        })
        .state('admin.property-translations.edit', {
          url: 'edit/:id/',
          css: '/css/admin.css',
          controller: 'PropertyTranslationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/translations/property-view.html');
          },
          resolve: {
            TranslationData: ['$q', 'Translation', '$stateParams', function ($q, Translation, $stateParams) {
              var d = $q.defer();
              Translation.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
            }],
            Translations: function () {
              return false;
            }
          }
        })
        .state('admin.property-translations.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'PropertyTranslationsCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/translations/property-view.html');
          },
          resolve: {
            TranslationData: [function () {
              return false;
            }],
            Translations: function () {
              return false;
            }
          }
        });
    }])
    .controller('TranslationsCtrl', ['Translations', 'TranslationData', 'TranslationDef', '$stateParams', '$scope', '$state', 'DTOptionsBuilder', '$http', 'Notification', 'CONFIG', function (Translations, TranslationData, TranslationDef, $stateParams, $scope, $state, DTOptionsBuilder, $http, Notification, CONFIG) {
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.languages = Translations;

      $scope.transValueSearch = "";

      $scope.$watch("transValueSearch", function(){
        if($scope.transValueSearch == ""){
          $scope.translationKeys = _.keys(TranslationDef).sort();
          $scope.transData = $scope.translationKeys.slice(0, $scope.pagination.perPage);
          $scope.pagination = {
            number: $scope.translation.length,
            current: 1,
            perPage: 10
          };
        }else{
          $scope.transData = [];
          $scope.translationKeys = [];
          var search = $scope.transValueSearch.toLowerCase();
          angular.forEach($scope.transValues, function (item, key) {
            item = item.toLowerCase();
            if (item.indexOf(search) != -1) {
              $scope.translationKeys.push(key);
            }
          });
          $scope.transData = $scope.translationKeys.slice(0, $scope.pagination.perPage);
          $scope.pagination = {
            number: $scope.translationKeys.length,
            current: 1,
            perPage: 10
          };
        }
      });

      $scope.translationOriginal = TranslationData;

      $scope.default = function () {
        $scope.translationDefault = TranslationDef;
      };

      $scope.translationSearch = '';
      $scope.translation = _.pairs(TranslationData);
      $scope.pagination = {
        number: $scope.translation.length,
        current: 1,
        perPage: 10
      };

      $scope.translationKeys = _.keys(TranslationDef).sort();
      $scope.transData = $scope.translationKeys.slice(0, $scope.pagination.perPage);
      $scope.search = function (t) {
        $scope.searchResult = TranslationData[t];
        $scope.searchKey = t;
      };
      $scope.transValues = {};
      _.each(TranslationData, function (v, k) {
        $scope.transValues[k] = v;
      });

      $scope.updateText = function (k) {
        $scope.translationOriginal[k] = $scope.transValues[k];
        var data = {
          data: $scope.translationOriginal,
          shortname: $stateParams.shortname
        };
        $http.post(CONFIG.API_URL + '/save-translation', data).then(function () {
          Notification.success({
            message: 'Translation Updated'
          });
        });
      };
      $scope.pageChanged = function () {
        $scope.transData = $scope.translationKeys.slice(($scope.pagination.current - 1) * $scope.pagination.perPage, ($scope.pagination.current - 1) * $scope.pagination.perPage + $scope.pagination.perPage);

      };
  }])
    .controller('PropertyTranslationsCtrl', ['Translations', 'TranslationData', 'Translation', '$stateParams', '$scope', '$state', 'DTOptionsBuilder', 'Notification', 'Modal', '$rootScope', '$timeout', function (Translations, TranslationData, Translation, $stateParams, $scope, $state, DTOptionsBuilder, Notification, Modal, $rootScope, $timeout) {
      $scope.dtOptions = DTOptionsBuilder.newOptions();
      $scope.translations = Translations;


      if (TranslationData) {
        $scope.translation = TranslationData;
      } else {
        $scope.translation = {
          property: {},
          amenities: [{}],
          texts: [{}]
        };
      }

      if ($rootScope.admin.type === 'translator') {
        $scope.languages = $rootScope.admin.languages;
      }

      $scope.propertyList = function () {
        Modal.propertyList();
      };

      $rootScope.$on("propertySelected", function (event, property) {
        $scope.translation.property = property;
      });

      $scope.delete = function (id) {
        Translation.delete(id).then(function () {
          Notification.success({
            message: 'Translation Deleted'
          });
          $scope.translations = _.without($scope.translations, _.findWhere($scope.translations, {
            id: id
          }));
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

      $scope.update = function () {
        if (_.keys($scope.translation.property).length) {
          $scope.translation.property = $scope.translation.property.id;
        }
        Translation.add($scope.translation).then(function () {
          Notification.success({
            message: 'Translation Modified'
          });
          $state.go('admin.property-translations', {}, {
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

      $timeout(function () {
        $('.inittable').click();
      }, 500);

      $scope.back = function () {
        $state.go('admin.property-translations');
      };
  }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.users', {
          url: 'users/',
          css: '/css/admin.css',
          controller: 'UsersCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/users/index.html');
          },
          resolve: {
            Users: ['User', '$q', function (User, $q) {
              var d = $q.defer();
              User.getAll().then(function (data) {
                d.resolve(data);
              });

              return d.promise;
          }],
            UserData: [function () {
              return false;
            }]
          }
        })
        .state('admin.users.view', {
          url: 'view/:id/',
          css: '/css/admin.css',
          controller: 'UsersCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/users/view.html');
          },
          resolve: {
            UserData: ['User', '$q', '$stateParams', function (User, $q, $stateParams) {
              var d = $q.defer();
              User.getDetails($stateParams.id).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
        .state('admin.users.add', {
          url: 'add/',
          css: '/css/admin.css',
          controller: 'UsersCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/users/view.html');
          },
          resolve: {
            UserData: [function () {
              return false;
          }]
          }
        });
    }])
    .controller('UsersCtrl', ['User', '$stateParams', '$scope', '$state', 'Users', 'UserData', 'DTOptionsBuilder', '$rootScope', 'Countries', 'Notification', 'Modal', 'Booking', '$timeout', '$filter', function (User, $stateParams, $scope, $state, Users, UserData, DTOptionsBuilder, $rootScope, Countries, Notification, Modal, Booking, $timeout, $filter) {
      $scope.userTypes = User.userTypes();
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bStateSave', true);
      $scope.users = Users;
      if (UserData) {
        if (!UserData.languages) {
          UserData.languages = [];
        }
        $scope.user = UserData;
        $scope.user.lastContact = $filter('defaultFullDateFormat')($scope.user.lastContact);
        $scope.user.created = $filter('defaultFullDateFormat')($scope.user.created);
      } else {
        $scope.user = {
          lastContact: moment().unix(),
          created: moment().unix(),
          languages: []
        };
      }

      $timeout(function () {
        $('.adduser').click();
      }, 500);

      $scope.bookingList = function (id) {
        Booking.find({
          user: id
        }).then(function (data) {
          var bookings = _.map(data.data, function (b) {
            b.status = Booking.getStatus(b.status);
            return b;
          });
          Modal.bookingList(bookings);
        });
      };

      $scope.languages = $rootScope.languages;
      $scope.countries = Countries.list;

      $scope.delete = function (id) {
        User.delete(id).then(function () {
          Notification.success({
            message: 'User Deleted'
          });
          $scope.users = _.without($scope.users, _.findWhere($scope.users, {
            id: id
          }));
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

      $scope.showLanguages = function () {
        var selected = [];
        angular.forEach($scope.languages, function (s) {
          if ($scope.user.languages.indexOf(s.shortname) >= 0) {
            selected.push(s.name);
          }
        });
        return selected.length ? selected.join(', ') : '-';
      };

      $scope.update = function () {
        User.add($scope.user).then(function () {
          Notification.success({
            message: 'User Modified'
          });
          $state.go('admin.users', {}, {
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

      $scope.back = function () {
        $state.go('admin.users', {}, {
          reload: true
        });
      };

  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('agent.book', {
        url: 'book/:id/:discount/',
        title: 'title_book',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/agent/book/index.html');
        },
        controller: 'AgentBookCtrl',
        resolve: {
          check: ["Booking", "Locale", "$q", "$stateParams", function (Booking, Locale, $q, $stateParams) {
            var d = $q.defer();

            Booking.check($stateParams.id, true).then(function (data) {
              if (data) {
                d.reject();
              } else {
                d.resolve();
              }
            });
            return d.promise;

            }],
          Dates: ["$q", "Locale", function ($q, Locale) {
            var d = $q.defer();
            var dates = Locale.getDates();
			if(!dates.valid){
				Locale.setDefaultDates(true);        // 2016-05-16 - Ajay - If dates are not valid then set default dates
				dates = Locale.getDates();
			}
            if (dates.valid) {
              d.resolve(dates);
            } else {
              d.reject();
            }

            return d.promise;
          }],
          PropertyData: ["Property", "$q", "$stateParams", function (Property, $q, $stateParams) {
            var d = $q.defer();
            Property.getDetails($stateParams.id).then(function (data) {
              d.resolve(data);
            }).catch(function (err) {
              d.reject(err, 404);
            });
            return d.promise;
          }],
          Message: ['Contact', '$q', 'Auth', function (Contact, $q, Auth) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              Contact.getMessage(null, data.data.id, null).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.resolve({
                  data: []
                });
              });
            });

            return d.promise;
          }]
        }
      });
    }])
    .controller('AgentBookCtrl', ['PropertyData', 'Message', 'Booking', 'Email', 'Calendar', 'Contact', 'Modal', 'gMaps', '$scope', 'CONFIG', '$rootScope', '$http', 'Discount', 'Locale', '$stateParams', 'Payment', '$compile', '$timeout', function (PropertyData, Message, Booking, Email, Calendar, Contact, Modal, gMaps, $scope, CONFIG, $rootScope, $http, Discount, Locale, $stateParams, Payment, $compile, $timeout) {
      $scope.paymentMethods = Payment.methods();

      $scope.selectPayment = function (id) {
        $scope.paymentType = parseInt(id);
        var paymentDirectiveData = _.findWhere($scope.paymentMethods, {
          id: parseInt(id)
        });
        if (paymentDirectiveData.cc) {
          $('#payment_placeholder').html('');
        } else {
          var paymentDirectiveName = paymentDirectiveData.directive;
          var paymentDirective = $compile(paymentDirectiveName)($scope);
          $('#payment_placeholder').html(paymentDirective);
        }

      };

      $scope.contact = {
        name: $rootScope.agent.name,
        email: $rootScope.agent.email
      };

      if (!_.isEmpty(Message)) {
        $scope.messages = Message;
		$timeout(function () {
            $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
          }, 1000);
      } else {
        $scope.messages = {};
      }

      $scope.askQuestion = function () {
        Contact.askQuestion($scope.contact, false, $scope.property.id).then(function (messages) {
          $scope.messages = messages;
          Modal.messageReceived();
          $scope.contact.message = '';
        });
      };

      $scope.getDay = function (timestamp) {
        return Contact.getDay(timestamp);
      };

      Calendar.loadCalendar();
      $scope.data = {};

      $scope.property = PropertyData.data.property;
      $scope.price = PropertyData.data.price;
      $scope.discount = {
        percent: 0
      };

      $scope.applyDiscount = function () {
        if (!$scope.discount_code) {
          $scope.invalidDiscount = 'Invalid';
          return false;
        }
        Discount.getDiscount($scope.discount_code, null, $scope.property.id).then(function (discount) {
          if (discount.length) {
            $scope.discount = discount[0];
          } else {
            $scope.discount = {
              "percent": 0
            };
            $scope.discount_code = 'Invalid';
          }
        });
      };

      if ($stateParams.discount) {
        Discount.getDiscount($stateParams.discount, null, $scope.property.id).then(function (discount) {
          if (discount.length) {
            $scope.discount = discount[0];
            $scope.discount_code = $stateParams.discount;
          } else {
            $scope.discount = {
              "percent": 0
            };
          }
        });
      } else {
        $scope.discount = {
          "percent": 0
        };
      }

      $scope.ownership = function () {
        Modal.ownership();
      };

      $scope.period = function () {

        return Locale.period($scope.nights);

      };


      $rootScope.$on("datesChanged", function (event, dates) {
        $scope.checkin = dates.checkin;
        $scope.checkout = dates.checkout;
        $http.get(CONFIG.API_URL + '/getprice', {
          params: {
            "property": $scope.property.id,
            "checkin": dates.checkin,
            "checkout": dates.checkout,
            "format": CONFIG.DEFAULT_DATE_FORMAT
          }
        }).success(function (data) {
          $scope.priceDay = data.price;
          $scope.nights = data.nights;
          var key;
          if ($scope.nights < 7) {
            key = 'commissionDay';
          } else if ($scope.nights < 30) {
            key = 'commissionWeek';
          } else if ($scope.nights < 365) {
            key = 'commissionMonth';
          } else {
            key = 'commissionYear';
          }
          $scope.agentCommission = $scope.price[key];

        });

        $scope.showPrices = true;
      });

      $scope.book = function () {

        var booking = {
          "property": $scope.property.id,
          "user": {
            "email": $scope.tenant.email,
            "name": $scope.tenant.name,
            "country": $scope.contact.country,
            "phone": $scope.contact.phone,
            "agent": $rootScope.agent.id
          },
          "agent": $rootScope.agent.id,
          "agentCommission": $scope.agentCommission,
          "discount": $scope.discount.id,
          "discountPercentage": $scope.discount.percent,
          "checkin": moment.utc($scope.checkin, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
          "checkout": moment.utc($scope.checkout, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
          "status": 0,
          "currency": _.findWhere($rootScope.currencies, {
            "currency": localStorage.getItem('currency')
          }).id,
          "paymentType": $scope.paymentType,
          "priceDay": $scope.priceDay,
          "created": moment().utc().unix(),
          "utilitiesElectricity": $scope.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us",
          "utilitiesWater": $scope.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us",
          "utilitiesWifi": "Included",
          "utilitiesCable": "Included BTV",
          "rate": $rootScope.currencyRate,
          "cleanfinalprice": $scope.property.cleanfinalprice,
          "cleanprice": $scope.property.cleanprice,
          "expires": moment().utc().add(CONFIG.BOOKING_DAYS_EXPIRE, 'day').unix(),
          "nights": $scope.nights,
          "pricePaid": 0,
          "emails": []
        };

        Booking.newBooking(booking).then(function (result) {
          var emailParams = {
            booking: result.data.id,
            subject: 'Your booking on ' + $scope.property.unique,
            language: $rootScope.language
          };
          Email.send('booking_confirmation', emailParams);
          Modal.newBookingAgent($scope.tenant.email, result.data.id);
        });
      };

    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent.booking', {
          url: 'booking/:id/',
          title: 'title_book',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/booking/index.html');
          },
          controller: 'AgentBookingCtrl',
          resolve: {
            BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
              var deferred = $q.defer();
              Booking.getDetails($stateParams.id).then(function (data) {
                deferred.resolve(data);
              }).catch(function (err) {
                deferred.reject(err, 404);
              });
              return deferred.promise;
          }],
            Message: ['Contact', '$q', '$rootScope', '$timeout', function (Contact, $q, $rootScope, $timeout) {
              var d = $q.defer();

              $timeout(function () {
                Contact.getMessage(null, null, $rootScope.agent.id).then(function (data) {
                  d.resolve(data);
                }).catch(function () {
                  d.resolve([]);
                });
              }, 1500);

              return d.promise;
              }]
          }
        });
    }])
    .controller('AgentBookingCtrl', ['BookingData', 'Contact', 'Modal', 'gMaps', '$scope', 'CONFIG', 'Locale', '$state', '$rootScope', 'Message', '$timeout', function (BookingData, Contact, Modal, gMaps, $scope, CONFIG, Locale, $state, $rootScope, Message, $timeout) {
      $scope.data = BookingData.data;
      $scope.data.checkin = moment.unix($scope.data.checkin).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
      $scope.data.checkout = moment.unix($scope.data.checkout).utc().format(CONFIG.DEFAULT_DATE_FORMAT);

      $scope.contact = {
        name: $rootScope.agent.name,
        email: $rootScope.agent.email
      };

      $scope.bookinglink = $state.href('booking', {
        id: $scope.data.id
      }, {
        absolute: true
      });

      if (!_.isEmpty(Message)) {
        $scope.messages = Message;
		$timeout(function () {
            $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
          }, 1000);
      } else {
        $scope.messages = {};
      }

      $scope.priceExtraTotal = 0;
      _.each($scope.data.priceExtra, function (extra) {
        $scope.priceExtraTotal = $scope.priceExtraTotal + parseInt(extra.price);
      });

      $scope.getDay = function (timestamp) {
        return Contact.getDay(timestamp);
      };

      $scope.translation = $scope.data.translation;
      $scope.property = $scope.data.property;
      $scope.messages = $scope.data.agentMessages;

      $scope.period = function () {

        return Locale.period($scope.data.nights);

      };

      $scope.askQuestion = function () {
        Contact.askQuestion($scope.contact, false, false, $scope.data.id).then(function (messages) {
          $scope.messages = messages;
          Modal.messageReceived();
          $scope.contact.message = '';
        });
      };

    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent.chat', {
          url: 'chat/:property/',
          title: 'title_chat',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/chat/index.html');
          },
          controller: 'AgentChatCtrl',
          resolve: {
            Message: ['Contact', '$q', 'Auth', function (Contact, $q, Auth) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {
                Contact.getMessage(null, data.data.id, null).then(function (data) {
                  d.resolve(data);
                }).catch(function (err) {
                  d.resolve({
                    data: []
                  });
                });
              });

              return d.promise;
          }]
          }
        });
    }])
    .controller('AgentChatCtrl', ['Message', 'Contact', 'Modal', '$rootScope', '$scope', 'CONFIG', 'Locale', '$state', '$stateParams', '$timeout', function (Message, Contact, Modal, $rootScope, $scope, CONFIG, Locale, $state, $stateParams, $timeout) {
      $scope.focusChat = function () {
        $timeout(function () {
          jQuery('form[name=contact-form] textarea').focus();
jQuery("form[name=contact-form] input[value='']:not(:checkbox,:button):visible:first").focus();
        }, 500);
      };

      if (!_.isEmpty(Message)) {
        $scope.messages = Message;
      } else {
        $scope.messages = {};
      }

      $scope.contact = {
        name: $rootScope.agent.name,
        email: $rootScope.agent.email
      };

      $scope.askQuestion = function () {
        Contact.askQuestion($scope.contact, false, $stateParams.property, false).then(function (messages) {
          $scope.messages = messages;
          Modal.messageReceived();
          $scope.contact.message = '';
        });
      };

      $scope.getDay = function (timestamp) {
        return Contact.getDay(timestamp);
      };

    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent', {
          url: '/agent/',
          css: '/css/style.css',
          abstract: false,
          template: '<ui-view></ui-view>',
          controller: ["$state", function ($state) {
            if ($state.current.name === 'agent') {
              $state.go('agent.home', {}, {
                reload: true
              });
            }
          }],
          resolve: {
            Agent: ['Auth', '$q', '$state', '$rootScope', function (Auth, $q, $state, $rootScope) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {
                if (data.data.type === 'agent') {
                  $rootScope.agent = data.data;
                  d.resolve(data.data);
                } else {
                  return $state.go('agent_login');
                }
              }).catch(function () {
                return $state.go('agent_login');
              });
              return d.promise;
          }]
          }
        })
        .state('agent.home', {
          url: 'home/',
          controller: 'AgentHomeCtrl',
          css: '/css/style.css',
          title: 'title_agent_home',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/home/index.html');
          },
          params: {
            searchonly: false
          },
          resolve: {
            Results: ['Locale', '$http', '$q', 'CONFIG', '$rootScope', '$stateParams', function (Locale, $http, $q, CONFIG, $rootScope, $stateParams) {
              var d = $q.defer();
              var dates = Locale.getDates(true, true);
              $http.get(CONFIG.API_URL + '/search-booking', {
                params: {
                  checkin: dates.checkin,
                  checkout: dates.checkout,
                  format: CONFIG.DEFAULT_DATE_FORMAT,
                  language: $rootScope.language,
                  location: 0,
                  searchonly: $stateParams.searchonly
                }
              }).then(function (data) {
                d.resolve(data);
              }).catch(function () {
                d.resolve([]);
              });

              return d.promise;

            }],
            Bookings: ['Auth', '$rootScope', 'Booking', '$q', function (Auth, $rootScope, Booking, $q) {
              var d = $q.defer();
              Auth.checkLogged().then(function () {
                return Booking.find({
                  agent: $rootScope.agent.id
                });
              }).then(function (data) {
                d.resolve(data.data);
              }).catch(function () {
                d.resolve([]);
              });

              return d.promise;

            }]
          }
        });
    }])
    .controller('AgentHomeCtrl', ['Results', '$stateParams', 'Bookings', 'Booking', 'Calendar', '$scope', 'Auth', '$state', '$timeout', '$rootScope', function (Results, $stateParams, Bookings, Booking, Calendar, $scope, Auth, $state, $timeout, $rootScope) {
		
	  $scope.loadCheckoutDate = 1;
		  
      Calendar.loadCalendar();
      if ($stateParams.searchonly) {
        $scope.searchonly = $stateParams.searchonly;
      }

      $scope.bookings = Bookings;

      $scope.nights = Calendar.nights();

      $scope.bookingsLimit = 10;

      $scope.getStatus = function (status) {
        return Booking.getStatus(status);
      };
      $scope.prices = Results.data.prices;
      $scope.defaultPrices = Results.data.defaultPrices;
      $scope.properties = Results.data.free;
      $scope.bookedproperties = Results.data.booked;
      $scope.whenFree = Results.data.whenFree;  
	
	  $scope.$on("datesChanged", function (event, dates) {		 
		if($scope.loadCheckoutDate == 2 && $state.current.name=='agent.home'){
			$scope.search($scope.searchonly);			
		}
		$scope.loadCheckoutDate++;		  
	  });
		
      $scope.search = function (searchonly) {
        $state.go('agent.home', {
          searchonly: searchonly
        }, {
          reload: true
        });
      };

      $scope.inittooltip = function () {
        $timeout(function () {
          $('.agent-table-tooltp').powerTip({
            placement: 'n',
            smartPlacement: true
          });
        });
      };
  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent_login', {
          controller: 'AgentLoginCtrl',
          url: '/agent/login/',
          title: 'title_agent_login',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/login/index.html');
          },
          resolve: {
            Agent: ['Auth', '$q', '$state', function (Auth, $q, $state) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {
                if (data.data.type === 'agent') {
                  $state.go('agent.home');
                  d.resolve(data.data);
                } else {
                  d.resolve();
                }
              }).catch(function () {
                d.resolve();
              });

              return d.promise;
          }]
          }
        })
        .state('agent_logout', {
          url: '/agent/logout/',
          resolve: {
            Logout: ['Auth', '$q', '$state', function (Auth, $q, $state) { 
              var d = $q.defer();
			  // 2016-05-26 - Ajay - Agent logout redirect on home page instead of agent login page
              Auth.logout().then(function () {
                $state.go('home', {}, {reload:true});
                d.resolve();
              }).catch(function () {
                $state.go('home', {}, {reload:true});
                d.resolve();
              });

              return d.promise;
          }]
          }
        });
    }])
    .controller('AgentLoginCtrl', ['$scope', 'Auth', '$state', function ($scope, Auth, $state) {
      $scope.login = function (e, p) {
        $scope.$error = false;
        Auth.loginAgent(e, p).then(function () {
          return $state.go('agent.home', {}, {reload:true});
        }).catch(function () {
          $scope.$error = true;
        });
      };

  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .directive('agentNavigation', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/agent/navigation/index.html');
        }
      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent_forgot', {
          url: '/agent/forgot/',
          controller: 'AgentForgotCtrl',
          title: 'title_agent_forgot',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/password-forgot/index.html');
          },
          resolve: {
            Agent: ['Auth', '$q', '$state', function (Auth, $q, $state) {
              var d = $q.defer();
              Auth.checkLogged().then(function (data) {
                if (data.type === 'agent') {
                  $state.go('agent.home');
                  d.resolve(data);
                } else {
                  d.resolve();
                }
              }).catch(function (err) {
                d.resolve();
              });
              return d.promise;
          }]
          }
        })
    }])
    .controller('AgentForgotCtrl', ['$scope', 'Auth', '$state', 'User', 'Modal', function ($scope, Auth, $state, User, Modal) {

      $scope.forgot = function (email) {
        $scope.error = false;
        Auth.forgotPassword(email).then(function () {
          $scope.success = true;
          Modal.default('You will receive an email with further instructions.')
        }).catch(function () {
          $scope.error = true;
        })
      }

  }])
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent_reset', {
          url: '/agent/reset/:token/',
          controller: 'AgentResetCtrl',
          title: 'title_agent_reset',
          css: '/css/style.css',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/agent/password-reset/index.html');
          },
          resolve: {
            Token: ['Auth', '$q', '$state', '$stateParams', function (Auth, $q, $state, $stateParams) {
              var d = $q.defer();
              Auth.checkToken($stateParams.token).then(function (data) {
                if (data) {
                  d.resolve(data);
                } else {
                  d.reject();
                }
              }).catch(function (err) {
                d.reject();
              });
              return d.promise;
          }]
          }
        })
    }])
    .controller('AgentResetCtrl', ['Token','Modal','$scope', 'User', '$state', '$stateParams', function (Token, Modal,$scope, User, $state, $stateParams) {
      
      $scope.update = function(password){
        var data = Token;
        data.token = '';
        data.password = password;
        User.update(data.id, data).then(function(data){
          Modal.default('Password Updated');
          $state.go('agent_login');
        }).catch(function(e){
          $scope.error = e;
        })
      }
      
  }])
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('agent.property', {
        url: 'property/:id/:action/',		
        title: 'title_property',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/agent/property/index.html');
        },
        controller: 'PropertyCtrl',
        resolve: {
          currentUser: ['$q', '$rootScope', function ($q, $rootScope) {
            var d = $q.defer();
            d.resolve({
              data: $rootScope.agent
            });

            return d.promise;
          }],
          PropertyData: ["Property", "$q", "$stateParams", function (Property, $q, $stateParams) {
            var deferred = $q.defer();
            Property.getDetails($stateParams.id).then(function (data) {
              deferred.resolve(data);
            }).catch(function (err) {
              deferred.reject(err, 404);
            });
            return deferred.promise;
          }],
          Ratings: ["Rating", "$q", "$stateParams", function (Rating, $q, $stateParams) {
            var d = $q.defer();
            Rating.getPropertyRatings($stateParams.id).then(function (data) {
              d.resolve(data);
            });
            return d.promise;
          }],
          Message: ['Contact', '$q', 'Auth', function (Contact, $q, Auth) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              return Contact.getMessage(null, data.data.id, null);
            }).then(function (data) {
              d.resolve(data);
            });

            return d.promise;
        }]
        }
      });
    }]);
})();
(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('agent_register', {
                url: '/agent/register/',
                controller: 'AgentRegisterCtrl',
                title: 'title_agent_login',
                css: '/css/style.css',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/agent/register/index.html');
                },
                resolve: {
                    Agent: ['Auth', '$q', '$state', function (Auth, $q, $state) {
                        var d = $q.defer();
                        Auth.checkLogged().then(function (data) {
                            if (data.type === 'agent') {
                                $state.go('agent.home');
                                d.resolve(data);
                            } else {
                                d.resolve();
                            }
                        }).catch(function () {
                            d.resolve();
                        });

                        return d.promise;
                    }]
                }
            });
        }])
        .controller('AgentRegisterCtrl', ['User', '$scope', 'Modal','$http','CONFIG', function (User, $scope, Modal, $http, CONFIG) {

            $http.get(CONFIG.HELPER_URL + '/users/getAdminsAndManagersAndTranslators', {}).then(function (res) {
                console.log("DATA FROM ADMINS", res);
                $scope.userList = res.data.data;
            });

            $scope.compareUserInfo = function (email) {
                if (typeof $scope.userList != 'undefined') {
                    var user = $scope.userList.filter(function (obj) {
                        return obj.email == email;
                    });
                    if (user.length) {
                        console.log('user type : ', user[0].type);
                        if (user[0].type == "admin" || user[0].type == "translator") {
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


            $scope.register = function () {
                var newAgent = {

                    name: $scope.data.name,
                    agent: $scope.data.name,
                    agency: $scope.data.agency,
                    email: $scope.data.email,
                    password: $scope.data.password,
                    phone: $scope.data.phone,
                    website: $scope.data.website,
                    line_messenger: $scope.data.line_messenger,
                    whatsapp: $scope.data.whatsapp,
                    facebook: $scope.data.facebook,
                    type: 'agent',
                    username: $scope.data.username
                };

                User.add(newAgent).then(function () {
                    $scope.disabled = true;
                    Modal.newAgent();
                }).catch(function (error) {
                    var errMsg = '';
                    for (var i in error.data.errors) {
                        errMsg += i + ' ' + error.data.errors[i];
                    }
                    //$scope.error = error.data.errors;
                    $scope.error = errMsg;
                });
            };

        }]);
})();
(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('management.book', {
                    url: 'book/',
                    controller: 'ManagerBookCtrl',
                    title: 'title_management_book',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/management/book/index.html');
                    },
                    params: {
                        property: false,
                        start: false,
                        end: false
                    },
                    css: ['/css/admin.css'],
                    resolve: {
                        Dates: ["Locale", function (Locale) {
                            var dates = Locale.getDates();
                            if (dates.valid) {
                                return {
                                    start: dates.checkin,
                                    end: dates.checkout
                                };
                            }
                            return {};
                        }],
                        PropertyData: ['$stateParams', 'Property', '$q', function ($stateParams, Property, $q) {
                            if ($stateParams.property) {
                                var d = $q.defer();
                                Property.getDetails($stateParams.property).then(function (data) {
                                    d.resolve(data.data);
                                }).catch(function () {
                                    d.reject();
                                });

                                return d.promise;
                            } else {
                                return false;
                            }
                        }]
                    }
                });
        }])
        .controller('ManagerBookCtrl', ['$scope', '$state', '$rootScope', 'Modal', 'Calendar', '$timeout', '$http', 'CONFIG', 'Notification', 'Property', 'Locale', 'Booking', 'PropertyData', '$stateParams', 'Dates', 'Payment', 'Countries', 'User', 'CountryToLanguage', 'Currency',
            function ($scope, $state, $rootScope, Modal, Calendar, $timeout, $http, CONFIG, Notification, Property, Locale, Booking, PropertyData, $stateParams, Dates, Payment, Countries, User, CountryToLanguage, Currency) {
                Calendar.loadCalendar(false, false, false, null);
                if ($stateParams.end) {
                    console.log($stateParams);
                    $scope.getPricesInCalendarCaase = function() {
                        $timeout(function () {
                            if (typeof $scope.data != 'undefined' && typeof $scope.pricesForRent != 'undefined') {
                                var data = $scope.pricesForRent;
                                $scope.data.priceDay = data.price;
                                $scope.data.nights = data.nights;
                                $scope.data.utilitiesElectricity = $scope.data.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us";
                                $scope.data.utilitiesWater = $scope.data.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us";
                                if ($scope.data.nights < 7) {
                                    $scope.data.priceSecurity = data.priceProps.depositDay;
                                    $scope.data.priceReservation = data.priceProps.reservationDay;
                                    $scope.agentPercent = $scope.fullPrice.commissionDay;
                                    $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                } else if ($scope.data.nights < 30) {
                                    $scope.data.priceSecurity = data.priceProps.depositWeek;
                                    $scope.data.priceReservation = data.priceProps.reservationWeek;
                                    $scope.agentPercent = $scope.fullPrice.commissionWeek;
                                    $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                } else if ($scope.data.nights < 365) {
                                    $scope.data.priceSecurity = data.priceProps.depositMonth;
                                    $scope.data.priceReservation = data.priceProps.reservationMonth;
                                    $scope.agentPercent = $scope.fullPrice.commissionMonth;
                                    $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                } else {
                                    $scope.data.priceSecurity = data.priceProps.depositYear;
                                    $scope.data.priceReservation = data.priceProps.reservationYear;
                                    $scope.agentPercent = $scope.fullPrice.commissionYear;
                                    $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                }
                                $scope.data.priceExtra.push({
                                    name: "Final cleaning",
                                    calc: "1 x " + $scope.data.property.cleanfinalprice,
                                    price: $scope.data.property.cleanfinalprice
                                });
                            }else{
                                $scope.getPricesInCalendarCaase();
                            }
                        }, 2000);
                    }
                    $scope.getPricesInCalendarCaase();
                }
                $scope.paymentMethods = Payment.methods();
                $scope.sources = Booking.getSources(null, true);
                $scope.countries = CountryToLanguage.getCountries();
                $scope.booking = {};
                $scope.bookingCurrency = '588a25ac3dd9c18b67717a5f';
                $scope.data = {
                    status: '0',
                    priceExtra: [],
                    discount: {
                        percent: 0
                    },
                    priceDay: 0,
                    nights: 0,
                    property: {
                        cleanfinalprice: 0
                    },
                    priceReservation: 0,
                    utilitiesWifi: "Included",
                    utilitiesCable: "Included BTV",
                    agent: {}
                };
                $scope.options = {
                    showDiscount: false,
                    addAgent: true,
                    addTenant: true,
                    calendarOpened: false,
                    showConditions: false,
                    showExpenses: false,
                    bookingSaved: false
                };

                $scope.data.paymentType = 5;


                $scope.data.priceReservation = "";
                $scope.longTheremPayDay = {
                    value: 1
                };
                $scope.longTheremPayPrice = {
                    value: ""
                };

                $scope.getValueForBookingScource = function (string) {
                    return string.charAt(1);
                };

                //$scope.data.conditionsTenant = "Electric and Water, you have to pay for what you use. Wifi and Cable TV included and paid by us. ";

                $scope.discountPrice = '';

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

                $scope.$watch('discountPrice', function () {
                    if ($scope.discountPrice > 0) {
                        $scope.discountPrice *= -1;
                    }
                });


                $scope.onDayPriceChange = function () {
                    $scope.data.priceDay = $("#datePriceField").val();
                    $scope.valueForRentPrice();
                    $scope.$apply();
                }

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
                    $scope.currentUserEditable = angular.copy($scope.data.tenant);
                }

                $scope.cancelUserEdit = function () {
                    $scope.data.tenant = $scope.currentUserEditable;
                    angular.element('#formTenant')[0].style.display = 'none';
                    angular.element('#showTenant')[0].style.display = 'inline';
                }

                $scope.saveUser = function () {
                    var currentUser = $scope.userList.filter(function (obj) {
                        return obj.email == $scope.data.tenant.email;
                    });
                    if (currentUser.length) {
                        User.update(currentUser[0].id, $scope.data.tenant);
                        if ($scope.data.tenant.country != '' && typeof $scope.data.tenant.country != 'undefined') {
                            var currentC = CountryToLanguage.getCurrencyByCountryName($scope.data.tenant.country);
                            Currency.getAll().then(function (data) {
                                console.log("CURRENT C : :", currentC)
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i].currency == currentC && data[i].active == true) {
                                        $scope.bookingCurrency = data[i].id;
                                    }
                                }
                                console.log($scope.bookingCurrency);
                            });
                        }
                    } else {
                        $scope.data.tenant.id = "";
                        $scope.data.tenant.username = $scope.data.tenant.name;
                        $scope.data.tenant.password = $scope.data.tenant.email;
                        $scope.data.tenant.type = 'tenant';
                        User.add($scope.data.tenant).then(function (data) {
                            var country = data.data.country;
                            if (country != '' && typeof country != 'undefined') {
                                var currentC = CountryToLanguage.getCurrencyByCountryName(country);
                                Currency.getAll().then(function (data) {
                                    console.log("CURRENT C : :", currentC)
                                    for (var i = 0; i < data.length; i++) {
                                        if (data[i].currency == currentC && data[i].active == true) {
                                            $scope.bookingCurrency = data[i].id;
                                        }
                                    }
                                    console.log($scope.bookingCurrency);
                                });
                            }

                        });
                    }
                }

                $scope.getDayPrice = function () {
                    $scope.valueForRentPrice();
                    $("#totalPriceInput").val($scope.valueForRentPrice())
                    return $scope.data.priceDay;
                }

                $scope.onRentPriceChange = function () {
                    if ($scope.data.discountAmount == '' || !$scope.data.discountAmount || typeof $scope.data.discountAmount == 'undefined') {
                        $scope.discountPrice = Math.round($scope.data.nights * $scope.data.priceDay / 100 * ($scope.data.discount.percent || 1));
                    }
                    $scope.data.priceDay = Number($("#totalPriceInput").val()) / $scope.data.nights;
                    $scope.valueForRentPrice();
                    $('#datePriceField').val($scope.data.priceDay);
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


                if (PropertyData) {
                    $scope.data.property = PropertyData.property;
                    $scope.fullPrice = PropertyData.price;
                }

                $scope.addExtra = function () {
                    $scope.data.priceExtra.push({
                        name: "",
                        calc: "",
                        price: 0
                    });
                };

                $scope.removeDiscount = function () {
                    $scope.options.showDiscount = false;
                    $scope.data.discount = {
                        percent: 0
                    };
                };

                $scope.removeExtra = function (i) {
                    $scope.data.priceExtra.splice(i, 1);
                    $scope.calcExtra();
                };
                $scope.calcExtra = function () {
                    var total = 0;
                    _.each($scope.data.priceExtra, function (item) {
                        total = total + parseInt(item.price);
                    });
                    $scope.priceExtraCalc = total;

                };

                $scope.propertyList = function () {
                    Modal.propertyList($scope.data.checkin, $scope.data.checkout);
                };

                $scope.currencyList = function () {
                    Modal.currencyList();
                };

                $scope.agentList = function () {
                    Modal.agentList(true, $scope.data.agentCommission);
                };

                $scope.tenantList = function () {
                    Modal.tenantList();
                };

                $scope.discountList = function () {
                    Modal.discountList();
                };

                $scope.emailList = function () {
                    Modal.emailList($scope.bookingID);
                };

                $scope.openCalendar = function () {

                    $scope.options.calendarOpened = true;
                    $timeout(function () {
                        try {
                            $('.arrival').data('dateRangePicker').open();
                        } catch (e) {
                            Calendar.destroy();
                            Calendar.loadCalendar($scope.data.checkin || false, $scope.data.checkout || false, false, $scope.bookings || null);
                            $timeout(function () {
                                $('.arrival').data('dateRangePicker').open();
                            }, 100);
                        }
                    });

                };

                $rootScope.$on("propertySelected", function (event, property) {

                    Calendar.destroy();
                    Property.getDetails(property.unique).then(function (data) {
                        if (typeof data.data.property.cleanfinalprice != 'undefined' && data.data.property.cleanfinalprice != 0) {//$$%%
                            $scope.data.priceExtra = $scope.data.priceExtra.filter(function (obj) {
                                return obj.name != "Final cleaning";
                            });
                            $scope.data.priceExtra.push({
                                name: "Final cleaning",
                                calc: "1 x " + data.data.property.cleanfinalprice,
                                price: data.data.property.cleanfinalprice
                            });
                        }
                        $scope.bookings = data.data.bookings;
                        $scope.fullPrice = data.data.price;
                        if ($scope.data.checkin && $scope.data.checkout) {
                            Calendar.loadCalendar($scope.data.checkin, $scope.data.checkout, false, $scope.bookings);
                        } else {
                            Calendar.loadCalendar(false, false, false, $scope.bookings);
                        }
                        $timeout(function () {
                            $scope.data.property = property;
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
                                    if ($scope.data.nights < 7) {
                                        $scope.data.priceSecurity = data.priceProps.depositDay;
                                        $scope.data.priceReservation = data.priceProps.reservationDay;
                                        $scope.agentPercent = $scope.fullPrice.commissionDay;
                                        $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                    } else if ($scope.data.nights < 30) {
                                        $scope.data.priceSecurity = data.priceProps.depositWeek;
                                        $scope.data.priceReservation = data.priceProps.reservationWeek;
                                        $scope.agentPercent = $scope.fullPrice.commissionWeek;
                                        $scope.data.agentCommission = Math.round(($scope.valueForRentPrice() + $scope.discountPrice) * ($scope.agentPercent / 100));
                                    } else if ($scope.data.nights < 365) {
                                        $scope.data.priceSecurity = data.priceProps.depositMonth;
                                        $scope.data.priceReservation = data.priceProps.reservationMonth;
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

                $rootScope.$on("agentSelected", function (event, agent, commission, conditionsAgent) {
                    $scope.data.agentCommission = commission;
                    $scope.data.conditionsAgent = conditionsAgent;
                    $scope.data.agent = agent;
                });

                $rootScope.$on("tenantSelected", function (event, tenant) {
                    $scope.data.tenant = tenant;
                });

                $rootScope.$on("discountSelected", function (event, discount) {
                    $scope.data.discount = discount;
                    $scope.options.showDiscount = true;
                    $scope.discountPrice = Math.round(Number($scope.data.nights * $scope.data.priceDay / 100 * ($scope.data.discount.percent || 1)));
                });

                $scope.$watch("discountPrice", function () {
                });

                $rootScope.$on("datesChanged", function (event, dates) {
                    $scope.applyDates(dates);
                });

                $scope.applyDates = function (dates) {
                    if ($scope.options.calendarOpened) {
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
                            }
                        });
                    }
                };

                if ($stateParams.property && $stateParams.start && $stateParams.end) {
                    $scope.options.calendarOpened = true;
                    $scope.data.checkin = $stateParams.start;
                    $scope.data.checkout = $stateParams.end;
                    $scope.applyDates({
                        checkin: $stateParams.start,
                        checkout: $stateParams.end
                    });
                }

                $scope.book = function () {
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
                    }

                    $scope.returnAgentId = function () {
                        if (typeof $scope.data.agent != 'undefined') {
                            return $scope.data.agent.id;
                        } else {
                            return "";
                        }
                    }
                    if ($scope.data.priceSecurity == null) {
                        $scope.data.priceSecurity = 0;
                    }

                    if ($scope.data.priceReservation == null) {
                        $scope.data.priceReservation = 0;
                    }
                    $scope.getDayDiff = function (date) {
                        var date = Math.round(new Date(date) / 1000);
                        var diff = Math.round((date - Math.round(new Date() / 1000)) / 86400);
                        return diff;
                    }

                    $scope.$watch('data.expires', function () {
                    })

                    var expires;

                    var checkinTime = moment($scope.data.checkin).utc();
                    var nowInMoment = moment().utc();

                    console.log('nnowInMoment: ' + nowInMoment);
                    console.log('checkinTime: ' + checkinTime);
                    console.log('checkinTime.diff: ' + checkinTime.diff(nowInMoment, 'days'));

                    if (checkinTime.diff(nowInMoment, 'days') == 0) {
                        expires = moment().utc().unix();
                    } else if (checkinTime.diff(nowInMoment, 'days') <= 6) {
                        expires = moment().utc().add(1, 'day').unix();
                    } else if (checkinTime.diff(nowInMoment, 'days') > 6 && checkinTime.diff(nowInMoment, 'days') < 30) {
                        expires = moment().utc().add(5, 'day').unix();
                    } else if (checkinTime.diff(nowInMoment, 'days') >= 30) {
                        expires = moment().utc().add(10, 'day').unix();
                    }


                    var booking = {
                        "property": $scope.data.property.id,
                        "user": {
                            "email": $scope.data.tenant.email,
                            "name": $scope.data.tenant.name
                        },
                        "agent": $scope.returnAgentId(),
                        "agentCommission": $scope.data.agentCommission,
                        "discount": $scope.data.discount.id,
                        "discountPercentage": $scope.data.discount.percent,
                        "checkin": moment.utc($scope.data.checkin, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
                        "checkout": moment.utc($scope.data.checkout, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
                        "status": 0,
                        "currency": $scope.bookingCurrency,
                        "priceExtra": $scope.getFilledExtra(),
                        "paymentType": $scope.data.paymentType,
                        "priceSecurity": $scope.data.priceSecurity,
                        "priceDay": $scope.data.priceDay,
                        "source": $scope.data.source,
                        "created": moment().utc().unix(),
                        "utilitiesElectricity": $scope.data.utilitiesElectricity,
                        "utilitiesWater": $scope.data.utilitiesWater,
                        "utilitiesWifi": $scope.data.utilitiesWifi,
                        "utilitiesCable": $scope.data.utilitiesCable,
                        "rate": $rootScope.currencyRate,
                        "discountAmount": $scope.discountPrice,
                        "cleanfinalprice": $scope.data.property.cleanfinalprice,
                        "cleanprice": $scope.data.property.cleanprice,
                        "expires": expires,
                        "nights": $scope.data.nights,
                        "conditionsAgent": $scope.data.conditionsAgent,
                        "conditionsTenant": $scope.data.conditionsTenant,
                        "pricePaid": 0,
                        "priceReservation": $scope.data.priceReservation,
                        "arrival": $scope.data.arrival,
                        "emails": [],
                        "rentpayday": $scope.data.rentpayday || 0,
                        "nextpayment": nextpaymentDate,
                        "electricPrice": $scope.data.property.electricUnit * ($scope.data.electricTo - $scope.data.electricFrom),
                        "electricFrom": $scope.data.electricFrom,
                        "waterFrom": $scope.data.waterFrom,
                        "waterTo": $scope.data.waterTo,
                        "waterPrice": $scope.data.property.waterUnit * ($scope.data.waterTo - $scope.data.waterFrom),
                        "electricTo": $scope.data.electricTo,
                        "departure": $scope.data.departure,
                        "comment": $scope.data.comment,
                        "longTermDay": $scope.longTheremPayDay.value,
                        "longTermAmount": $scope.longTheremPayPrice.value
                    };

                    Booking.newBooking(booking).then(function (newbooking) {
                        Modal.newBookingManagement(newbooking.data.id);
                        $scope.options.bookingSaved = true;
                        $scope.bookingID = newbooking.data.id;

                        var userCountry = CountryToLanguage.getCountryByName($scope.data.tenant.country).code;

                        $http.post(CONFIG.HELPER_URL + '/booking/setBooking/', {
                            checkin: moment($scope.data.checkin).format('YYYY-MM-DD'),
                            checkout: moment($scope.data.checkout).subtract(1, 'days').format('YYYY-MM-DD'),
                            user: $scope.data.tenant.name,
                            userEmail: $scope.data.tenant.email,
                            userPhone: $scope.data.tenant.phone,
                            userCountry: $scope.data.tenant.country,
                            totalPrice: $scope.valueForRentPrice(),
                            deposit: $scope.data.priceSecurity,
                            th_id: $scope.bookingID,
                            prop: $scope.data.property.unique,
                            status: 0,
                            arrival: $scope.data.arrival
                        }).success(function (data) {
                            console.log("DATA FROM BEDS24 about this booking :", data);
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
            }]);
})();

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

(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('management.bookings', {
                    url: 'bookings/',
                    controller: 'ManagementBookingsCtrl',
                    title: 'title_management_bookings',
                    css: ['/css/admin.css'],
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/management/bookings/index.html');
                    },
                    params: {
                        bookingType: 0,
                    },
                    resolve: {
                        Bookings: ['Booking', '$q', '$rootScope', '$stateParams', function (Booking, $q, $rootScope, $stateParams) {
                            var d = $q.defer();
                            Booking.findManagementOld({
                                status: parseInt($stateParams.bookingType)
                            }).then(function (data) {
                                d.resolve(data.data);
                            }).catch(function () {
                                d.resolve([]);
                            });
                            return d.promise;
                        }]
                    }
                });
        }])
        .controller('ManagementBookingsCtrl', ['Bookings', 'Notification', '$state', 'Booking', '$stateParams', '$scope', 'DTOptionsBuilder', function (Bookings, Notification, $state, Booking, $stateParams, $scope, DTOptionsBuilder) {
            $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('iDisplayLength', 50);
            $scope.bookings = Bookings;
            $scope.bookingType = $stateParams.bookingType.toString();
            // Booking.find().then(function (res) {
            //     $scope.extendedBooking = res.data;
            // });

            $scope.extendedBooking = $scope.bookings;



            $scope.getExpDatebyID = function (id) {
                if (typeof $scope.extendedBooking != 'undefined' && $scope.extendedBooking.length) {
                    var current = $scope.extendedBooking.filter(function (obj) {
                        return obj.id == id;
                    });
                    return current[0].expires * 1000;
                }
            }

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

            $scope.getSourceOfBooking = function (id) {
                if (typeof $scope.extendedBooking != 'undefined' && $scope.extendedBooking.length) {
                    var current = $scope.extendedBooking.filter(function (obj) {
                        return obj.id == id;
                    });
                    return current[0].source;
                }
            };

            $scope.getStatus = function (status) {
                return Booking.getStatus(status);
            };

            $scope.statuses = Booking.getStatus(false, true);

            $scope.selected = [];

            $scope.query = {
                filter: '',
                order: 'checkin',
                page: 1
            };

            $scope.selectBooking = function () {
                Notification.success({
                    message: 'Loading...'
                });
                if ($scope.bookingType === 'old') {
                    var when = moment().add(-14, 'day').format('x');
                    var query = {
                        status: {
                            $in: [0, 1, 2]
                        },
                        created: {
                            $lte: when
                        }
                    };
                    Booking.find(query).then(function (data) {
                        $scope.bookings = data.data;
                    });
                } else if ($scope.bookingType === 'all') {
                    Booking.find({}).then(function (data) {
                        $scope.bookings = data.data;
                    });
                } else {
                    var type = parseInt($scope.bookingType);
                    $state.go('management.bookings', {
                        bookingType: type
                    }, {
                        reload: true,
                        notify: true
                    });
                }

            };

        }]);
})();

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

(function () {
  'use strict';
  angular.module('ThaiHome')
    .directive('managementMenu', ['$templateCache', function ($templateCache) {
      return {
        template: function () {
          return $templateCache.get('templates/management/menu/index.html');
        },
        controller: 'ManagementMenuCtrl',
        restrict: 'AE',
      };
    }])
  .controller('ManagementMenuCtrl', ["$rootScope", "$state", "$scope", function($rootScope, $state, $scope){
    $scope.menu_messages = $rootScope.menu_messages;
    $scope.menu_bookings = $rootScope.menu_bookings;
    $scope.statename = $state.current.name;
  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('management.message', {
          url: 'message/:id/',
          css: ['/css/admin.css'],
          controller: 'ManagerMessageCtrl',
          title: 'title_management_properties',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/management/message/index.html');
          },
          resolve: {
            Message: ['Contact', '$stateParams', '$q', function (Contact, $stateParams, $q) {
              var d = $q.defer();
              Contact.getMessage($stateParams.id).then(function (data) {
                d.resolve(data);
				if(!data.read){ // When open message its set to read
					Contact.readMessage($stateParams.id);
				}
              });
              return d.promise;
            }]
          }
        });
    }])
    .controller('ManagerMessageCtrl', ['Message', 'Contact', '$stateParams', '$scope','$timeout','User',
     function (Message, Contact, $stateParams, $scope,$timeout, User) {
          $scope.messages = Message;
          $scope.agentExist = false;
         $scope.contact = Message.user;
          $scope.propertyToShow = '';

          if( typeof $scope.messages.messages[$scope.messages.messages.length - 1].booking == 'object'
              && $scope.messages.messages[$scope.messages.messages.length - 1].booking != null){
            $scope.currentBookingId = $scope.messages.messages[$scope.messages.messages.length - 1].booking.id;
            if($scope.messages.messages[$scope.messages.messages.length - 1].booking.agent != ''){
              $scope.agentExist = true;
                User.getDetails($scope.messages.messages[$scope.messages.messages.length - 1].booking.user).then(function(data){
                    console.log(data,'user detailes');
                    $scope.messages.user = data;
                    $scope.contact = $scope.messages.user;

                });
              User.getDetails($scope.messages.messages[$scope.messages.messages.length - 1].booking.agent).then(function(data){
                  console.log(data,'agent detailes');
                  $scope.agentData = data;
                });
            }
          }

          if(typeof $scope.messages.messages[$scope.messages.messages.length - 1].property == 'object'
              && $scope.messages.messages[$scope.messages.messages.length - 1].property != null){
            $scope.propertyToShow = $scope.messages.messages[$scope.messages.messages.length - 1].property.unique
          }


          console.log('booking id: ', $scope.currentBookingId);
          console.log('messages', $scope.messages);
    	  $timeout(function () {
    		$('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
    	  }, 1000);

          $scope.lastUnread = Contact.latestUnread($scope.messages);

          $scope.getDay = function (timestamp) {
            return Contact.getDay(timestamp);
          };


    	  /**
    	   * 2016-06-02 - Ajay - When manager reply first get message thread and then add new message fuckin' idiot
    	   **/
          $scope.askQuestion = function () {
        		Contact.getMessage($stateParams.id).then(function (data) {
        			Contact.replyQuestion(data, $scope.contact.message, $scope.currentBookingId).then(function (messages) {
                Contact.getMessage($stateParams.id).then(function (data) {
                  $scope.messages = data;
                });
        				console.log('messages', $scope.messages);
        				//$scope.messages = messages;
        				$scope.contact.message = '';
        			});
        		});
          };

  }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('management.messages', {
          url: 'messages/',
          css: ['/css/admin.css'],
          controller: 'ManagerMessagesCtrl',
          title: 'title_management_properties',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/management/messages/index.html');
          },
          resolve: {
            Messages: ['Contact', '$q', function (Contact, $q) {
              var d = $q.defer();

              Contact.getUnread({
                sort: {
                  updated: 1
                }
              }).then(function (data) {
                d.resolve(data);
              });
              return d.promise;
            }]
          }
        });
    }])
    .controller('ManagerMessagesCtrl', ['Messages', 'Calendar', '$stateParams', '$scope', 'Contact', 'Notification', function (Messages, Calendar, $stateParams, $scope, Contact, Notification) {
      $scope.skip = 25;
      $scope.limit = 10;
      if (_.isObject(Messages) && !_.isArray(Messages)) {
        $scope.unread = [Messages];
      } else {
        $scope.unread = Messages;
      }

      $scope.lastUnread = function (message) {
        return Contact.latestUnread(message);
      };

      //$scope.timeDiff = moment.utc().subtract(12, 'hours').unix();
      $scope.timeDiff = moment.utc().subtract(24, 'hours').unix(); // 2016-06-14 - Ajay - Set time less than 24 hours
      $scope.timeDiff1 = moment.utc().subtract(6, 'hours').unix(); // 2016-06-14 - Ajay - Set time less than 24 hours
      $scope.timeDiff2 = moment.utc().subtract(12, 'hours').unix(); // 2016-06-14 - Ajay - Set time less than 24 hours
        console.log($scope.timeDiff);

      $scope.load = function () {
        Contact.getUnread({
          limit: $scope.limit,
          skip: $scope.skip,
          sort: {
            updated: 1
          }
        }).then(function (data) {
          if (data.length) {
            $scope.unread = _.union($scope.unread, data);
            $scope.skip += $scope.limit;
          } else {
            $scope.noMore = true;
            Notification.info({
              message: '<span style="color:#fff">No more messages</span>',
              delay: 2000
            });
          }
        });
      };
  }]);
})();

/**
* 2016-05-17 - Ajay
* ManagerProfileCtrl - Controller for Profile Page
* Where manager update there signature.
**/
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('management.profile', {
          url: 'profile/',
          css: ['/css/admin.css'],
          controller: 'ManagerProfileCtrl',
          title: 'title_management_profile',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/management/profile/index.html');
          }
        });
    }])
    .controller('ManagerProfileCtrl', ['User', '$stateParams', '$scope', '$state', '$rootScope', 'Notification', function ( User, $stateParams, $scope, $state, $rootScope, Notification) {
		$scope._signature = $rootScope.admin.signature
		
	$scope.update = function () {        
        var user = {
          "signature": $scope._signature          
        };

        User.update($rootScope.admin.id, user).then(function () {
			Notification.success({
				message: 'Signature Updated !'
			});
			$state.go('management.profile', {}, {
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
     
	}]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('management.properties', {
          url: 'properties/',
          css: ['/css/admin.css'],
          controller: 'ManagerPropertiesCtrl',
          title: 'title_management_properties',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/management/properties/index.html');
          },
          resolve: {
            Results: ['Locale', '$http', '$q', 'CONFIG', '$rootScope', '$stateParams', function (Locale, $http, $q, CONFIG, $rootScope, $stateParams) {
              var d = $q.defer();
              var dates = Locale.getDates(true);
              $http.get(CONFIG.API_URL + '/search-booking', {
                params: {
                  checkin: dates.checkin,
                  checkout: dates.checkout,
                  format: CONFIG.DEFAULT_DATE_FORMAT,
                  language: $rootScope.language,
                  location: 0,
                  searchonly: $stateParams.searchonly
                }
              }).then(function (data) {
                d.resolve(data.data);
              });
              return d.promise;

            }],
          }
        });
    }])
    .controller('ManagerPropertiesCtrl', ['Results', 'Calendar', '$stateParams', '$scope', '$state', '$rootScope', function (Results, Calendar, $stateParams, $scope, $state, $rootScope) {
      Calendar.loadCalendar();
      $scope.datesChangedCount = 0;
      $scope.nights = Calendar.nights();

      $scope.prices = Results.prices;
      $scope.defaultPrices = Results.defaultPrices;
      $scope.properties = Results.free;
      $scope.bookedproperties = Results.booked;
      $scope.whenFree = Results.whenFree;

      $rootScope.$on("datesChanged", function (event, dates) {
        $scope.checkin = dates.checkin;
        $scope.checkout = dates.checkout;
      });

      $scope.search = function () {
        $state.go('management.properties', {}, {
          reload: true
        });
      };
  }]);
})();
(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('management.property', {
                url: 'property/:id/',
                title: 'title_property',
                css: '/css/admin.css',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/management/property/index.html');
                },
                controller: 'ManagementPropertyCtrl',
                resolve: {
                    PropertyData: ["Property", "$q", "$stateParams", function (Property, $q, $stateParams) {
                        var deferred = $q.defer();
                        Property.getDetails($stateParams.id).then(function (data) {
                            deferred.resolve(data);
                        }).catch(function (err) {
                            deferred.reject(err, 404);
                        });
                        return deferred.promise;
                    }]
                }
            });
        }])
        .controller('ManagementPropertyCtrl', ["PropertyData", "$timeout", "$scope", "$state", "Calendar", "Modal", '$http', 'CONFIG','$stateParams','Bookings',
            function (PropertyData, $timeout, $scope, $state, Calendar, Modal, $http, CONFIG, $stateParams,Bookings) {
                Calendar.loadCalendar(false, false, false, PropertyData.data.bookings);
                $scope.property = PropertyData.data.property;
                $scope.translation = PropertyData.data.translation;
                $scope.price = PropertyData.data.price;
                $scope.price.priceYear = Math.floor($scope.price.priceYear / 12);
                $scope.agentrentlink = $state.href('agent.property', {
                    id: $scope.property.unique
                }, {
                    absolute: true
                });

                $http.post(CONFIG.HELPER_URL + '/booking/getBookingsForProperty', {
                    "property": $scope.property.id,
                }).success(function (data) {
                    $scope.propertyBookings = data.bookings;
                    var userIds = [];
                    function sortingByCheckinDate(a,b) {
                        if (a.checkin < b.checkin)
                            return -1;
                        if (a.checkin > b.checkin)
                            return 1;
                        return 0;
                    }
                    $scope.propertyBookings.sort(sortingByCheckinDate);

                    for(var i = 0; i < $scope.propertyBookings.length; i++){
                        userIds.push($scope.propertyBookings[i].user);
                        $scope.propertyBookings[i].checkin = moment(new Date($scope.propertyBookings[i].checkin * 1000)).format('DD, MMMM YYYY');
                        $scope.propertyBookings[i].checkout = moment(new Date($scope.propertyBookings[i].checkout * 1000)).format('DD, MMMM YYYY');
                    }
                    $http.post(CONFIG.HELPER_URL + '/users/getUsersByMultipleIds', {
                        'ids':userIds
                    }).then(function(res){
                       console.log("USERS OF BOOKINGS :", res.data.data);
                       $scope.usersOfBookings = res.data.data;
                       $scope.getUserById = function(id){
                           var currentUser = $scope.usersOfBookings.filter(function(obj){
                              return obj._id == id;
                           })[0];
                           return currentUser.name;
                       }
                    });
                });

                $('.copy_btn').on('click', function(){
                    var data_id = document.querySelector('#data_id');
                    data_id.value = "";
                    // select the contents
                    data_id.value = this.getAttribute("data-text");
                    console.log(data_id.value);
                    data_id.select();
                    document.execCommand('copy'); // or 'cut'
                })




                $scope.booked = PropertyData.data.booked;

                $scope.rentlink = $state.href('property', {
                    id: $scope.property.unique
                }, {
                    absolute: true
                });
                $scope.salelink = $state.href('sale', {
                    id: $scope.property.unique
                }, {
                    absolute: true
                });

                $scope.openCalendar = function () {
                    $timeout(function () {
                        $('.arrival, .departure').data('dateRangePicker').open();
                    });
                };

                $scope.propertyDetails = function () {
                    Modal.propertyDetails($scope.property, $scope.translation, true);
                };
            }]);
})();
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

(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('about', {
        url: '/about/',
        title: 'title_about',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/about/index.html');
        },
        controller: "AboutCtrl",
        resolve: {
          Ratings: ["$q", "Rating", function ($q, Rating) {
            var d = $q.defer();
            Rating.getRatings().then(function (data) {
              d.resolve(data);
            });
            return d.promise;
          }]
        }
      });
    }])
    .controller("AboutCtrl", ["$scope", "Ratings", function ($scope, Ratings) {
      $scope.ratings = Ratings.data;
      $scope.nrRatings = 5;
      $scope.moreReviews = function () {
        $scope.nrRatings += 5;
      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .controller('AuthCtrl', ["$scope", "Auth", function ($scope, Auth) {
      $scope.credentials = {
        "email": "",
        "password": ""
      };

      $scope.login = function () {
        Auth.login($scope.credentials);
      };
    }])
    .factory('Auth', ['$http', 'User', 'CONFIG', '$q', '$rootScope', 'Email', '$timeout', 'dpd', function ($http, User, CONFIG, $q, $rootScope, Email, $timeout, dpd) {

      function checkToken(token) {
        var d = $q.defer();
        $http.get(CONFIG.API_URL + '/users', {
          params: {
            token: token
          }
        }).then(function (data) {
          if (data.data.length) {
            d.resolve(data.data[0]);
          } else {
            d.reject();
          }
        }).catch(function () {
          d.reject();
        });

        return d.promise;
      }

      function loginAgent(email, password) {
        var d = $q.defer();
        $http.post(CONFIG.API_URL + '/users/login', {
          "username": email.toLowerCase(),
          "password": password
        }).then(function (data) {
          return data;
        }).then(function (data) {
          return User.getDetails(data.data.uid);
        }).then(function (data) {
          var token = genToken();
          localStorage.setItem('auth', token);
          localStorage.removeItem('agent');
          data.auth = token;
          return $http.post(CONFIG.API_URL + '/users', data);
        }).then(function (data) {
          if (data.data.type === 'agent') {
            $rootScope.agent = data.data;
            d.resolve(data.data);
          } else {
            logout();
            d.reject();
          }
        }).catch(function (err) {
          d.reject(err);
        });

        return d.promise;
      }

      function loginAdmin(email, password) {
        var d = $q.defer();
        $http.post(CONFIG.API_URL + '/users/login', {
          "username": email.toLowerCase(),
          "password": password
        }).then(function (data) { 
          return data;
        }).then(function (data) {
          return User.getDetails(data.data.uid);
        }).then(function (data) {
          var token = genToken();
          localStorage.setItem('auth', token);
          data.auth = token;
          return $http.post(CONFIG.API_URL + '/users', data);
        }).then(function (data) {
          if (data.data.type === 'admin' || data.data.type === 'translator') {
            $rootScope.admin = data.data;
            d.resolve(data.data);
          } else {
            logout();
            d.reject();
          }
        }).catch(function (err) {
          d.reject(err);
        });

        return d.promise;
      }


      function forgotPassword(email) {
        var d = $q.defer();
        User.getDetails(false, email).then(function (data) {
          if (data.type === 'tenant') {
            d.reject();
          } else {
            var token = '';
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 40; i++) {
              token += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            data.token = token;
            return data;
          }
        }).then(function (data) {
          return User.update(data.id, data);
        }).then(function (data) {
          var params = {
            to: data.email,
            token: data.token,
            language: $rootScope.language,
            subject: 'Your password reset request'
          };
          return Email.send('forgot_password', params);
        }).then(function () {
          d.resolve();
        }).catch(function (e) {
          d.reject();
        });

        return d.promise;
      }

      function logout() {
        var d = $q.defer();
        localStorage.removeItem('auth');
        $http.post(CONFIG.API_URL + '/users/logout').then(function (data) {
          $rootScope.agent = false;
          $rootScope.admin = false;
          d.resolve(data);
        }).catch(function (err) {
          d.reject(err);
        });

        return d.promise;
      }

      function genToken() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 20; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
      }

      function checkLogged() {
        var d = $q.defer();
        var token = localStorage.getItem('auth');
        if (token != null) {
          $http.get(CONFIG.API_URL + '/users', {
            params: {
              auth: token
            }
          }).then(function (data, err) {
            if (data.data.length) {
              if (data.data[0].type === 'agent') {
                $rootScope.agent = data.data[0];
              } else if (data.data[0].type === 'admin') {
                $rootScope.admin = data.data[0];
              }
              d.resolve({
                data: data.data[0]
              });
            } else {
              d.resolve({
                data: {}
              });
            }
          });
        } else {
          dpd.users.get('me', function (data, error) {
            if (data && _.isObject(data)) {
              if (data.type === 'agent') {
                $rootScope.agent = data;
              } else if (data.type === 'admin') {
                $rootScope.admin = data;
              }
              d.resolve({
                data: data
              });
            } else {
              d.resolve({
                data: {}
              });
            }
          });
        }

        return d.promise;
      }
      return {
        loginAgent: loginAgent,
        logout: logout,
        checkLogged: checkLogged,
        forgotPassword: forgotPassword,
        checkToken: checkToken,
        loginAdmin: loginAdmin,
        genToken: genToken
      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('autologin', {
        url: '/autologin/:email/',
        template: '',
        resolve: {
          login: ['User', '$q', '$stateParams', '$state', '$timeout', function (User, $q, $stateParams, $state, $timeout) {
            var d = $q.defer();
            localStorage.removeItem('auth');
            User.getOne(atob($stateParams.email)).then(function (data) {
              d.resolve(data);
              $timeout(function () {
                $state.go('contact');
              }, 1500)
            }).catch(function () {
              $state.go('home');
              d.resolve();
            });
            return d.promise;
          }]
        }
      });
    }]);
})();
(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("bankAccounts", [function () {
      return {
        get: function () {
          return["Kbank ThaiHome","Krungsri","Michael", "Kbank", "Cash"];
        }
      };
    }]);
})();

(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('book', {
                    url: '/book/:id/:discount/:agent/',
                    title: 'title_book',
                    css: '/css/style.css',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/thaihome/book/index.html');
                    },
                    controller: 'BookCtrl',
                    resolve: {
                        check: ["Booking", "Locale", "$q", "$stateParams", "$state", "$location", function (Booking, Locale, $q, $stateParams, $state, $location) {
                            var d = $q.defer();
                            console.log("Send", $stateParams, "Book ", Booking);
                            Booking.check($stateParams.id).then(function (data) {
                                if (data) {
                                    console.log("test-book");
                                    d.reject();
                                } else {
                                    console.log("no-data", data);
                                    d.resolve();
                                }
                            });

                            return d.promise;

                        }],
                        Location: ['$q', 'IPLocation', function ($q, IPLocation) {
                            console.log("get-Location");
                            var d = $q.defer();
                            IPLocation.get().then(function (data) {
                                d.resolve(data);
                                console.log("location-data", data);
                            }).catch(function () {
                                d.resolve(null);
                            });
                            return d.promise;
                        }],
                        Agent: ['$q', 'User', 'Locale', function ($q, User, Locale) {
                            console.log("get-agent");
                            var d = $q.defer();
                            if (Locale.getAgent()) {
                                User.getDetails(Locale.getAgent()).then(function (data) {
                                    if (data.type === 'agent') {
                                        d.resolve(data);
                                    } else {
                                        d.resolve(false);
                                    }
                                }).catch(function () {
                                    d.resolve(false);
                                });
                            } else {
                                d.resolve(false);
                            }

                            return d.promise;
                        }],
                        currentUser: ['Auth', '$q', function (Auth, $q) {
                            var d = $q.defer();
                            Auth.checkLogged().then(function (data) {
                                d.resolve(data);
                            }).catch(function () {
                                d.resolve({});
                            });

                            return d.promise;
                        }],
                        Dates: ["$q", "Locale", "$state", "$location", function ($q, Locale, $state, $location) {
                            console.log("get-dates and path", localStorage.getItem('past-booking-id'));
                            if (localStorage.getItem('past-booking-id') != null) {
                                window.location.pathname = "/booking/" + localStorage.getItem('past-booking-id');
                            } else {
                                var d = $q.defer();
                                var dates = Locale.getDates();
                                console.log('set dates form local', dates);
                                if (dates.valid) {
                                    console.log("date.valid");
                                    d.resolve(dates);
                                    console.log("Reslove");
                                } else {
                                    /** Ajay - Check local booking id and redirect to booking page while refresh at second step. */
                                    if (localStorage.getItem('past-booking-id') && localStorage.getItem('past-booking-id') != '') {
                                        $location.path('/booking/' + localStorage.getItem('past-booking-id') + '/');
                                        d.resolve({});
                                    } else {
                                        d.reject();
                                    }
                                }
                                return d.promise;
                            }
                        }],
                        PropertyData: ["Property", "$q", "$stateParams", "$http", "CONFIG", "Locale", function (Property, $q, $stateParams, $http, CONFIG, Locale) {

                            var deferred = $q.defer();
                            var property;
                            Property.getDetails($stateParams.id).then(function (data) {
                                console.log("getDetails-data", data, $stateParams.id);
                                var property = data.data;
                                var dates = Locale.getDates();
                                $http.post(CONFIG.HELPER_URL + '/price/getPrice/', {

                                    "propertyID": property.property.id,
                                    "checkin": Date.parse(dates.checkin) / 1000,
                                    "checkout": Date.parse(dates.checkout) / 1000,

                                }).success(function (data) {
                                    // console.log("---------------------------Data is -------------", data)
                                    deferred.resolve({
                                        price: data.priceFindResult,
                                        property: property
                                    });
                                });

                            }).catch(function (err) {
                                deferred.reject(err, 404);
                            });
                            return deferred.promise;
                        }],
                        Ratings: ["Rating", "$q", "$stateParams", function (Rating, $q, $stateParams) {
                            var d = $q.defer();
                            Rating.getPropertyRatings($stateParams.id).then(function (data) {
                                d.resolve(data);
                            });
                            return d.promise;
                        }],
                        Message: ['Contact', '$q', 'Auth', function (Contact, $q, Auth) {
                            var d = $q.defer();
                            Auth.checkLogged().then(function (data) {
                                Contact.getMessage(null, data.data.id, null).then(function (data) {
                                    d.resolve(data);
                                }).catch(function () {
                                    d.resolve({
                                        data: []
                                    });
                                });
                            });

                            return d.promise;
                        }],
                        CountriesList: ['Countries', function (Countries) {
                            return Countries.list;
                        }]
                    }
                })
                .state('booking', {
                    url: '/booking/:id/:action/',
                    title: 'title_book',
                    css: '/css/style.css',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/thaihome/booking/index.html');
                    },
                    controller: 'BookingCtrl',
                    params: {
                        sendPaymentPending: false,
                        action: {
                            squash: true
                        }
                    },
                    resolve: {
                        BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
                            var deferred = $q.defer();
                            Booking.getDetails($stateParams.id).then(function (data) {
                                deferred.resolve(data);
                            }).catch(function (err) {
                                deferred.reject(err, 404);
                            });
                            return deferred.promise;
                        }],
                        // Email: ["Email", "$stateParams", "$rootScope", "$q", function (Email, $stateParams, $rootScope, $q) {
                        //     var deffered = $q.defer();
                        //     if ($stateParams.sendPaymentPending) {
                        //         Email.send('payment_payment_bank', {   // 2016-05-27 - Ajay - Change type email
                        //             booking: $stateParams.id,
                        //             preview: false,
                        //             subject: $rootScope.T.email_subject_payment_pending,
                        //             language: $rootScope.language
                        //         }).then(function () {
                        //             deffered.resolve();
                        //         }).catch(deffered.resolve);
                        //     } else {
                        //         deffered.resolve();
                        //     }
                        //     return deffered.promise;
                        // }],
                        Status: ["$stateParams", "$q", "Booking", function ($stateParams, $q, Booking) {

                            var deffered = $q.defer();
                            if ($stateParams.sendPaymentPending) {
                                Booking.update($stateParams.id, {
                                    status: 1,
                                    paymentType: 0
                                }).then(deffered.resolve).catch(deffered.resolve);
                            } else {
                                deffered.resolve();
                            }
                            return deffered.promise;
                        }]
                    }
                }).state('booking.noParam', {
                    url: '/booking/:id/',
                    title: 'title_book',
                    css: '/css/style.css',
                    templateProvider: function ($templateCache) {
                        return $templateCache.get('templates/thaihome/booking/index.html');
                    },
                    controller: 'BookingCtrl',
                    params: {
                        sendPaymentPending: false,
                        action: {
                            squash: true
                        }
                    },
                    resolve: {
                        BookingData: ["Booking", "$q", "$stateParams", function (Booking, $q, $stateParams) {
                            var deferred = $q.defer();
                            Booking.getDetails($stateParams.id).then(function (data) {
                                deferred.resolve(data);
                            }).catch(function (err) {
                                deferred.reject(err, 404);
                            });
                            return deferred.promise;
                        }],
                        // Email: ["Email", "$stateParams", "$rootScope", "$q", function (Email, $stateParams, $rootScope, $q) {
                        //     var deffered = $q.defer();
                        //     if ($stateParams.sendPaymentPending) {
                        //         Email.send('payment_payment_bank', {   // 2016-05-27 - Ajay - Change type email
                        //             booking: $stateParams.id,
                        //             preview: false,
                        //             subject: $rootScope.T.email_subject_payment_pending,
                        //             language: $rootScope.language
                        //         }).then(function () {
                        //             deffered.resolve();
                        //         }).catch(deffered.resolve);
                        //     } else {
                        //         deffered.resolve();
                        //     }
                        //     return deffered.promise;
                        // }],
                        Status: ["$stateParams", "$q", "Booking", function ($stateParams, $q, Booking) {
                            var deffered = $q.defer();
                            if ($stateParams.sendPaymentPending) {
                                Booking.update($stateParams.id, {
                                    status: 1,
                                    paymentType: 0
                                }).then(deffered.resolve).catch(deffered.resolve);
                            } else {
                                deffered.resolve();
                            }
                            return deffered.promise;
                        }]
                    }
                });
        }])
        .factory("Booking", ["dpd", "$http", "User", "$q", "CONFIG", "Locale", "Property", "Modal", function (dpd, $http, User, $q, CONFIG, Locale, Property, Modal) {

            function check(property, agent, timestamps) {
                var d = $q.defer();
                console.log("check-var", Property, Locale);
                console.log("check-Book", property, agent, timestamps);
                Property.getDetails(property).then(function (data) {
                        var dates = Locale.getDates();
                        //This Moment is work make to unix
                        var checkin = moment(dates.checkin, CONFIG.DEFAULT_DATE_FORMAT).add(6, 'hours').unix();
                        var checkout = moment(dates.checkout, CONFIG.DEFAULT_DATE_FORMAT).unix();
                        //console.log("moment", moment.unix(checkout).utc().unix());
                        return dpd.booking.get({
                            property: data.data.property.id,
                            checkin: {
                                $lte: moment.unix(checkout).utc().unix()
                            },
                            checkout: {
                                $gt: moment.unix(checkin).utc().unix()
                            },
                            $limit: 1
                        });
                    }).then(function (data) {
                        console.log("steps2", data);
                        if (data.data.length) {
                            if (agent) {
                                Modal.doubleBookingAgent(data.data[0]);
                            } else {
                                Modal.doubleBooking(data.data[0]);
                            }
                            d.reject(data.data[0]);
                        } else {
                            console.log("False");
                            d.resolve(false);
                        }
                    })
                    .catch(function (err) {
                        d.reject(err, 404);
                    });

                return d.promise;

            }

            function getSources(source, all) {
                //console.log("");
                var booking_sources = [{
                    "value": 0,
                    "name": "[T] ThaiHome"
                }, {
                    "value": 1,
                    "name": "[B] Booking.com"
                }, {
                    "value": 2,
                    "name": "[A] AirBnB"
                }, {
                    "value": 4,
                    "name": "[E] Expedia"
                }];

                if (all) return booking_sources;
                //console.log("get-Sources",booking_sources);

                return _.findWhere(booking_sources, {
                    value: source
                });

            }

            function getDetails(id, lng) {
                console.log("getDetails-and id");
                var language = localStorage.getItem('locale');
                if (typeof lng != 'undefined') {
                    language = lng;
                }
                var d = $q.defer();
                if (!id) {
                    d.reject();
                } else {
                    $http.get(CONFIG.API_URL + '/booking/' + id, {
                            params: {
                                "language": language
                            }
                        })
                        .then(function (response) {
                            d.resolve(response);
                        }, function (err) {
                            d.reject(err);
                        });
                }
                return d.promise;
            }

            function findManagement() {
                console.log("Find Mange");
                var d = $q.defer();
                $http.get(CONFIG.API_URL + '/getbookings/')
                    .then(function (response) {
                        d.resolve(response);
                    }, function () {
                        d.resolve({
                            data: []
                        });
                    });
                return d.promise;
            }


            function findManagementOld(query) {
                var d = $q.defer();
                $http.get(CONFIG.API_URL + '/getbookingsold/', {
                        params: query
                    })
                    .then(function (response) {
                        console.log('getbook form api');
                        d.resolve(response);
                    }, function () {
                        d.resolve({
                            data: []
                        });
                    });
                return d.promise;
            }

            function find(query) {
                var d = $q.defer();
                dpd.booking.get(query)
                    .then(function (response) {
                        console.log("Query is:", response);
                        d.resolve(response);
                    }, function () {
                        d.resolve({
                            data: []
                        });
                    });
                return d.promise;
            }

            function update(id, data) {
                var d = $q.defer();
                $http.put(CONFIG.API_URL + '/booking/' + id, data).then(function (data) {
                    d.resolve(data.data);
                }).catch(function (e) {
                    d.reject(e);
                });
                return d.promise;
            }

            function del(id) {
                var d = $q.defer();
                $http.delete(CONFIG.API_URL + '/booking/' + id).then(function (data) {
                    d.resolve(data);
                }).catch(function (e) {
                    d.reject(e);
                });
                return d.promise;
            }

            /**
             * 2016-05-13 - Ajay - Delete Selected & All bookings
             **/
            function delAll(data) {
                var d = $q.defer();
                $http.post(CONFIG.API_URL + '/deleteall', data).then(function (data) {
                    d.resolve(data);
                }).catch(function (e) {
                    d.reject(e);
                });
                return d.promise;
            }

            function newBooking(booking) {
                console.log("mandorin :", booking);
                var bookingData = booking;
                var d = $q.defer();
                User.getOne(booking.user.email, booking.user, true).then(function (user) {
                    return user;
                }).then(function (data) {
                    bookingData.user = data.id;

                    return $http.post(CONFIG.API_URL + '/booking', bookingData);
                }).then(function (result) {
                    d.resolve(result);
                }).catch(function (err) {
                    d.reject(err);
                });
                return d.promise;
            }

            function getStatus(status, all) {
                console.log("GET-STATUS");
                var booking_statuses = [{
                        "value": 0,
                        "name": "New Booking"
                    }, {
                        "value": 1,
                        "name": "Pending"
                    },
                    {
                        "value": 2,
                        "name": "Booked"
                    }, {
                        "value": 3,
                        "name": "Check-in"
                    }, {
                        "value": 4,
                        "name": "Check-out"
                    }, {
                        "value": 5,
                        "name": "Done"
                    },
                    {
                        "value": 6,
                        "name": "Cancelled"
                    }
                ];

                if (all) return booking_statuses;
                //console.log(booking_statuses);
                return _.findWhere(booking_statuses, {
                    value: status
                });
            }
            console.log("Test function");
            //getStatus();
            //newBooking();
            return {
                getStatus: getStatus,
                getSources: getSources,
                newBooking: newBooking,
                find: find,
                check: check,
                getDetails: getDetails,
                update: update,
                delete: del,
                deleteAll: delAll,
                findManagement: findManagement,
                findManagementOld: findManagementOld
            };

        }])
        .controller('BookingCtrl', ['BookingData', 'Payment', 'Contact', 'Modal', 'gMaps', '$scope', 'CONFIG', '$compile', '$rootScope', '$state', 'Booking', 'Notification', '$stateParams', '$timeout', function (BookingData, Payment, Contact, Modal, gMaps, $scope, CONFIG, $compile, $rootScope, $state, Booking, Notification, $stateParams, $timeout) {
            $scope.showLastChat = function () {
                $timeout(function () {
                    jQuery('.smaller-chat').scrollTop(jQuery('.smaller-chat')[0].scrollHeight);
                }, 1000);
            };

            $scope.isBookingController = true;


            $scope.showPayment = false;

            $scope.showPaymentToggle = function () {
                $scope.showPayment = !$scope.showPayment;
                if ($scope.data.paymentType == 0 || $scope.data.paymentType == 1 || $scope.data.paymentType == 3) {
                    $scope.selectPayment($scope.data.paymentType);
                }
                $('body').animate({
                    scrollTop: 0
                }, '300');
                setTimeout(function () {
                    angular.element('.search-option-payment').val($scope.data.paymentType);
                }, 300);
            };

            /** Ajay - Remove local booking id after arrive in booking page */
            localStorage.removeItem('past-booking-id');

            $scope.chatdisabled = false;
            $scope.data = BookingData.data;

            // pay calc start
            $scope.getInvoiceTotal = function (invoice) {
                var total = 0;
                for (var i = 0; i < invoice.invoiceLines.length; i++) {
                    total += invoice.invoiceLines[i].amountTotal;
                }
                return total;
            };

            $scope.mustPayBooking = function () {
                var mustPay = 0;
                if ($scope.payedAlready() == 0) {
                    if ($scope.data.priceReservation != null && $scope.data.priceReservation != 0) {
                        mustPay = $scope.data.priceReservation;
                    } else {
                        mustPay = $scope.data.cleanfinalprice + ($scope.data.priceDay * $scope.data.nights - ($scope.data.priceDay * $scope.data.nights / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                    }
                    return mustPay;
                } else {
                    return mustPay;
                }
            };

            $scope.ratingUrl = window.location.origin + "/rating/" + $scope.data.id;
            $scope.calculateMissingPrice = function () {
                var mustPay = 0;
                for (var i = 0; i < $scope.data.invoice.length; i++) {
                    mustPay += $scope.getInvoiceTotal($scope.data.invoice[i]);
                }
                var payedAmount = 0;
                for (var j = 0; j < $scope.data.receipt.length; j++) {
                    payedAmount += $scope.data.receipt[j].amount;
                }

                if ($scope.data.discountPercentage != 0) {
                    $scope.payableAmount = ($scope.data.priceDay * $scope.data.nights - ($scope.data.priceDay * $scope.data.nights / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                } else if (typeof $scope.data.discountAmount != 'undefined') {
                    $scope.payableAmount = ($scope.data.priceDay * $scope.data.nights + Number($scope.data.discountAmount)) + $scope.priceExtra;
                } else {
                    $scope.payableAmount = $scope.data.priceDay * $scope.data.nights + $scope.priceExtra;
                }
                window.amount = $scope.payableAmount;
                if (payedAmount != 0) {
                    $scope.payableAmount = $scope.payableAmount - payedAmount;
                    $scope.reservationAction = false;
                } else {
                    $scope.payableAmount = $scope.payableAmount;
                    $scope.reservationAction = true;
                }
                return $scope.payableAmount;
            };
            $scope.$watch('payableAmount', function () {
                if (typeof $scope.T != 'undefined') {
                    $scope.payableReservationText = $scope.T.transReservePay.replace('#AMOUNT#', bothPrices($scope.payableAmount, $rootScope.currency, Number($rootScope.currencyRate), 'right'));
                }
            });
            $rootScope.$watch('currency', function () {
                if (typeof $scope.T != 'undefined') {
                    $scope.payableReservationText = $scope.T.transReservePay.replace('#AMOUNT#', bothPrices($scope.payableAmount, $rootScope.currency, Number($rootScope.currencyRate), 'right'));
                }
            });

            $scope.totalPrice = function () {
                if ($scope.data.discountPercentage != 0) {
                    return ($scope.data.priceDay * $scope.data.nights - ($scope.data.priceDay * $scope.data.nights / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;

                } else if (typeof $scope.data.discountAmount != 'undefined') {
                    return ($scope.data.priceDay * $scope.data.nights + Number($scope.data.discountAmount)) + $scope.priceExtra;

                } else {
                    return $scope.data.priceDay * $scope.data.nights + $scope.priceExtra;
                }
            }


            $scope.payDayLessThenFourDays = function () {
                if ((Math.round(new Date($scope.data.checkin) / 1000)) < Math.round(new Date() / 1000) + 345600) {
                    return true;
                } else {
                    return false;
                }
            };
            $scope.calcPayMethod = function () {
                var payMethod = '';
                if (typeof $scope.T != 'undefined') {
                    if ((Math.round(new Date($scope.data.checkin) / 1000)) < Math.round(new Date() / 1000) + 604800) {
                        payMethod = '<b>' + $scope.T.transMethodCard + '</b> ' + $scope.T.transOr + ' <b>' + $scope.T.transMethodPal + '</b>'
                    } else {
                        payMethod = '<b>' + $scope.T.transMethodCard + '</b> ' + $scope.T.transOr + ' <b>' + $scope.T.transMethodBank + '</b> ' + $scope.T.transOr + ' <b>' + $scope.T.transMethodPal + '</b>';
                    }
                    return payMethod;
                }
            };
            $scope.payedAlready = function () {
                var payedAmount = 0;
                for (var j = 0; j < $scope.data.receipt.length; j++) {
                    payedAmount += $scope.data.receipt[j].amount;
                }
                return payedAmount;
            };

            //  The payment props calc
            $scope.isBooking = true;
            $scope.data.checkin = moment.unix(BookingData.data.checkin).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
            $scope.data.checkout = moment.unix(BookingData.data.checkout).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
            $scope.data.expires = moment.unix(BookingData.data.expires).utc().format(CONFIG.DEFAULT_DATE_FORMAT);
            $scope.saveDates = function () {
                Booking.update($scope.data.id, {
                    arrival: $scope.data.arrival,
                    departure: $scope.data.departure
                }).then(function () {
                    $scope.contact.message = "I set my Arrival Time to: " + $scope.data.arrival + "\n\nI set my Departure Time to: " + $scope.data.departure;
                    Contact.askQuestion($scope.contact, false, false, $scope.data.id).then(function (messages) {
                        $scope.messages = messages;
                        $scope.contact.message = '';
                        $scope.chatdisabled = false;
                        Notification.success({
                            message: 'Arrival/Departure dates updated!'
                        });
                    });
                });
            };
            $scope.changeDates = function () {
                jQuery('form[name=contact-form] textarea').val('Hi, I would like to change my booking dates to:').focus();
                jQuery('html, body').animate({
                    scrollTop: jQuery("chat").offset().top - 66
                }, 2000);
            };

            $scope.steps = [{
                templateUrl: 'templates/payment/steps/final.html',
                hasForm: true,
                title: 'Update validity'
            }, ];

            $scope.voucherLink = $state.href('voucher', {
                id: $scope.data.id
            }, {
                absolute: true
            });

            if (!$rootScope.agent) {
                if (BookingData.data.user != undefined) {
                    $scope.contact = {
                        name: BookingData.data.user.name,
                        email: BookingData.data.user.email
                    };
                } else {
                    $scope.contact = {};
                }
            } else {
                $scope.contact = {
                    name: $rootScope.agent.name,
                    email: $rootScope.agent.email
                };
            }

            $scope.priceExtra = 0;
            _.map($scope.data.priceExtra, function (price) {
                $scope.priceExtra += parseInt(price.price);
            });

            $scope.paymentMethods = Payment.storefrontPayments();
            $scope.selectPayment = function (id) {
                var paymentDirectiveData = _.findWhere($scope.paymentMethods, {
                    id: parseInt(id)
                });
                var paymentDirectiveName = paymentDirectiveData.directive;

                var AMOUNT = $scope.data.cleanfinalprice + ($scope.data.priceDay * $scope.data.nights - ($scope.data.priceDay * $scope.data.nights / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                $timeout(function () {
                    var paymentDirective = $compile('<payment-' + paymentDirectiveName + ' rate="' + $scope.data.rate + '" language="' + $rootScope.language + '" currency="' + $scope.data.currency.currency + '" amount="' + AMOUNT + '" bookingid="' + $scope.data.id + '"></payment-' + paymentDirectiveName + '>')($scope);
                    $('#payment_placeholder').html(paymentDirective);
                }, 1000);


            };

            $scope.translation = BookingData.data.translation;
            $scope.property = BookingData.data.property;

            if (BookingData.data.messages != undefined) {
                BookingData.data.messages.messages = _.sortBy(BookingData.data.messages.messages, 'date'); // 2016-05-17 - Ajay - Sort Messages at booking page
                $scope.messages = BookingData.data.messages;
                $timeout(function () {
                    $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
                }, 500);
            } else {
                $scope.messages = [];
            }


            $scope.$on('mapInitialized', function (event, map) {
                var data = {
                    address2: $scope.property.address2,
                    address3: $scope.property.address3,
                    name: $scope.property.name,
                    featured: $scope.property.featured,
                    unique: $scope.property.unique,
                    gmapsdata: $scope.property.gmapsdata
                };
                gMaps.propertyMap(map, data);

                $scope.openGallery = function () {
                    Modal.openGallery($scope.property.images, $scope.property.unique);
                };

                $scope.rules = function () {
                    Modal.rules($scope.translation);
                };

                $scope.cancellation = function () {
                    Modal.cancellation();
                };

                $scope.askQuestion = function () {
                    $scope.chatdisabled = true;
                    Contact.askQuestion($scope.contact, false, false, $scope.data.id).then(function (messages) {
                        $scope.messages = messages;
                        Modal.messageReceived();
                        $scope.contact.message = '';
                        $scope.chatdisabled = false;
                    });
                };
                $scope.paymentError = false;
                if ($stateParams.action == 'card_error') {
                    $scope.paymentError = true;
                    $scope.showPaymentToggle();
                    $scope.$apply();
                }

                if ($stateParams.action == 'PAY') {
                    $scope.showPaymentToggle();
                    $scope.$apply();
                }

                if ($stateParams.action === 'contact') {
                    $('html,body').animate({
                        scrollTop: $("chat").offset().top - 65
                    });
                    $("#txtChat").focus();
                } else if ($stateParams.action === 'watch') {
                    $scope.openGallery();
                } else if ($stateParams.action === 'rules') {
                    $scope.rules();
                } else if ($stateParams.action === 'cancel') {
                    $scope.cancellation();
                } else if ($stateParams.action == 'time') {
                    angular.element('body').stop().animate({
                        scrollTop: angular.element('#arrivalTimeInput').offset().top - 150
                    }, '500', 'swing');
                    setTimeout(function () {
                        angular.element('#arrivalTimeInput').focus();
                    }, 400);
                }
            });
        }])
        .controller('BookCtrl', ['CountriesList', 'Booking', 'Locale', 'Discount', 'Modal', 'currentUser', 'Message', '$http', '$scope', 'PropertyData', 'Rating', 'Contact', '$rootScope', 'CONFIG', 'gMaps', '$stateParams', 'Dates', 'Email', 'Agent', 'Payment', '$compile', 'Location', '$timeout', '$sce', function (CountriesList, Booking, Locale, Discount, Modal, currentUser, Message, $http, $scope, PropertyData, Rating, Contact, $rootScope, CONFIG, gMaps, $stateParams, Dates, Email, Agent, Payment, $compile, Location, $timeout, $sce) {
            $scope.helperUrl = CONFIG.HELPER_URL;
            $scope.reservationAction = false;
            $scope.paypalBookBtn = function () {
                Booking.update($scope.bookingID, {
                    status: 1,
                    paymentType: 3
                }).then(function () {
                    window.location.pathname = "/booking/" + $scope.bookingID;
                });
            };

            $http.get(CONFIG.HELPER_URL + '/users/getAdminsAndManagersAndTranslators', {}).then(function (res) {
                console.log("DATA FROM ADMINS", res);
                $scope.userList = res.data.data;
            });

            $scope.compareUserInfo = function (email) {
                if (typeof $scope.userList != 'undefined') {
                    var user = $scope.userList.filter(function (obj) {
                        return obj.email == email;
                    });
                    if (user.length) {
                        console.log('user type : ', user[0].type);
                        if (user[0].type == "admin" || user[0].type == "translator") {
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

            $scope.paymentMethods = Payment.storefrontPayments();
            $scope.selectPayment = function (id) {
                $scope.paymentType = parseInt(id);
                var paymentDirectiveData = _.findWhere($scope.paymentMethods, {
                    id: parseInt(id)
                });
                var paymentDirectiveName = paymentDirectiveData.directive;
                var AMOUNT = $scope.payableAmount;
                $timeout(function () {
                    var paymentDirective = $compile('<payment-' + paymentDirectiveName + '></payment-' + paymentDirectiveName + '>')($scope);
                    $('#payment_placeholder').html(paymentDirective);
                }, 1000);
            };
            //console.log(PropertyData.price);
            $scope.property = PropertyData.property;
            $scope.translation = PropertyData.property.translation;
            $scope.price = 0;
            $scope.price = PropertyData.price;
            $scope.nights = PropertyData.price.nights;
            $scope.reservationAction = false;

            $scope.getReservationPrice = function () {
                // console.log('set-andconfig-price');
                if ($scope.price == 0 && typeof $scope.discount != 'undefined') {
                    $scope.getReservationPrice();
                } else {
                    console.log($scope.price.priceTotal)
                    $scope.payableAmount = 0;
                    $scope.priceDay = $scope.price.priceNight;
                    $scope.property.cleanfinalprice = 750;
                    $scope.property.cleanprice = 750;
                    window.amount = 0;
                    if ($scope.price.priceNight != 0 && typeof $scope.price.priceNight != 'undefined' &&
                        $scope.price.reservationWeek != 0 && typeof $scope.price.reservationWeek != 'undefined' &&
                        $scope.price.reservationMonth != 0 && typeof $scope.price.reservationMonth != 'undefined' &&
                        $scope.price.reservationYear != 0 && typeof $scope.price.reservationYear != 'undefined') {
                        console.log("GOT TO RESERVATION");
                        if ($scope.nights < 7) {
                            $scope.payableAmount = $scope.price.reservationDay;
                            window.amount = $scope.price.reservationDay;
                        } else if ($scope.nights < 30) {
                            $scope.payableAmount = $scope.price.reservationWeek;
                            window.amount = $scope.price.reservationWeek;
                        } else if ($scope.nights < 365) {
                            $scope.payableAmount = $scope.price.reservationMonth;
                            window.amount = $scope.price.reservationMonth;
                        } else {
                            $scope.payableAmount = $scope.price.reservationYear;
                            window.amount = $scope.price.reservationYear;
                        }
                        $scope.reservationAction = true;
                    } else {
                        console.log("GOT TO TOTAL");
                        if ($scope.data.discountPercentage != 0) {
                            $scope.payableAmount = ($scope.price.priceTotal - ($scope.price.priceTotal / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                            window.amount = ($scope.price.priceTotal - ($scope.price.priceTotal / 100 * $scope.data.discountPercentage)) + $scope.priceExtra;
                        } else if (typeof $scope.data.discountAmount != 'undefined') {
                            $scope.payableAmount = ($scope.price.priceTotal + Number($scope.data.discountAmount)) + $scope.priceExtra;
                            window.amount = ($scope.price.priceTotal + Number($scope.data.discountAmount)) + $scope.priceExtra;
                        } else {
                            $scope.payableAmount = $scope.data.priceTotal;
                            window.amount = $scope.data.priceTotal + $scope.priceExtra;
                        }
                    }
                }
            };

            $scope.$watch('payableAmount', function () {
                if (typeof $scope.T != 'undefined') {
                    $scope.payableReservationText = $scope.T.transReservePay.replace('#AMOUNT#', bothPrices($scope.payableAmount, $rootScope.currency, Number($rootScope.currencyRate), 'right'));
                }
            });
            $rootScope.$watch('currency', function () {
                if (typeof $scope.T != 'undefined') {
                    $scope.payableReservationText = $scope.T.transReservePay.replace('#AMOUNT#', bothPrices($scope.payableAmount, $rootScope.currency, Number($rootScope.currencyRate), 'right'));
                }
            });

            $scope.payableReservationText = $scope.T.transReservePay.replace('#AMOUNT#', $scope.payableAmount);

            $scope.priceDay = PropertyData.price.price;
            $scope.countries = CountriesList;
            $scope.refAgent = Agent;
            if ($stateParams.discount) {
                Discount.getDiscount($stateParams.discount, currentUser.data.id, $scope.property.id).then(function (discount) {
                    if (discount.length) {
                        $scope.discount = discount[0];
                    } else {
                        $scope.discount = {
                            "percent": 0
                        };
                    }
                    $scope.getReservationPrice();
                });
            } else {
                $scope.discount = {
                    "percent": 0
                };
                $scope.getReservationPrice();
            }


            if (!_.isEmpty(currentUser.data)) {
                $scope.contact = {};
                $scope.contact.name = currentUser.data.name;
                $scope.contact.email = currentUser.data.email;
                $scope.contact.message = '';
                $scope.contact.country = currentUser.data.country;
                $scope.contact.phone = currentUser.data.phone;
            } else {
                $scope.contact = {};
            }
            var pastBookingCountry = localStorage.getItem('past-booking-country');
            if (pastBookingCountry !== null) {
                $scope.contact.country = pastBookingCountry;
            } else {
                $scope.contact.country = Location && Location.data && Location.data.country || null;
            }

            if (!_.isEmpty(Message.data)) {
                $scope.messages = Message.data[0];
            } else {
                $scope.messages = {};
            }


            $scope.askQuestion = function () {
                if ($scope.messages.id) {
                    var subMessage = {
                        "date": moment().unix(),
                        "manager": false,
                        "message": $scope.contact.message,
                        "property": $stateParams.id
                    };
                    $scope.messages.read = false;
                    $scope.messages.messages.push(subMessage);
                } else {
                    var newMessage = {
                        read: false,
                        messages: [{
                            "manager": false,
                            "date": moment().unix(),
                            "message": $scope.contact.message,
                            "property": $stateParams.id
                        }]
                    };

                    $scope.messages = newMessage;
                }

                Contact.askQuestion($scope.contact.name, $scope.contact.email, $scope.messages);
                Modal.messageReceived();
                $scope.contact.message = '';
            };

            $scope.getDay = function (timestamp) {
                //console.log("get-days-timestamp");
                return Contact.getDay(timestamp);
            };

            $scope.openGallery = function () {
                Modal.openGallery($scope.property.images, $scope.property.unique);
            };

            $scope.propertyDetails = function () {
                Modal.propertyDetails($scope.property, $scope.translation);
            };

            $scope.rules = function () {
                Modal.rules($scope.translation);
            };

            $scope.cancellation = function () {
                Modal.cancellation();
            };
            $scope.checkin = Dates.checkin;
            $scope.checkout = Dates.checkout;


            $scope.steps = [{
                    templateUrl: 'templates/payment/steps/first.html',
                    title: 'Introduction',
                    hasForm: true
                },
                {
                    templateUrl: 'templates/payment/steps/final.html',
                    hasForm: true,
                    title: 'Update validity'
                }
            ];


            $scope.book = function () {

                console.log("PROPERTY : ", $scope.property);
                var reservation = 0;
                var deposit = 0;

                if ($scope.nights < 7) {
                    reservation = $scope.price.reservationDay;
                    deposit = $scope.price.depositDay;
                } else if ($scope.nights < 30) {
                    reservation = $scope.price.reservationWeek;
                    deposit = $scope.price.depositWeek;
                } else if ($scope.nights < 365) {
                    reservation = $scope.price.reservationMonth;
                    deposit = $scope.price.depositMonth;
                } else {
                    reservation = $scope.price.reservationYear;
                    deposit = $scope.price.depositYear;
                }

                var checkinTime = moment($scope.checkin).utc();
                var nowInMoment = moment().utc();

                var expTime = '';

                if (checkinTime.diff(nowInMoment, 'days') == 0) {
                    expTime = moment().utc().unix();
                } else if (checkinTime.diff(nowInMoment, 'days') <= 6) {
                    expTime = moment().utc().add(1, 'day').unix();
                } else if (checkinTime.diff(nowInMoment, 'days') > 6 && checkinTime.diff(nowInMoment, 'days') < 30) {
                    expTime = moment().utc().add(5, 'day').unix();
                } else if (checkinTime.diff(nowInMoment, 'days') >= 30) {
                    expTime = moment().utc().add(10, 'day').unix();
                }

                console.log(" exp date : ", expTime, " : DIFF : ", checkinTime.diff(nowInMoment, 'days'));

                $scope.discountPrice = 0;

                if (typeof $scope.discount.percent != 'undefined') {
                    $scope.discountPrice = Math.round($scope.nights * $scope.priceDay / 100 * ($scope.discount.percent || 1));
                }

                if (typeof deposit == 'undefined') {
                    deposit = 0;
                }
                console.log("Booking data", $scope.property.property.unique);
                var booking = {
                    "property": $scope.property.property.unique,
                    "user": {
                        "email": $scope.contact.email,
                        "name": $scope.contact.name,
                        "country": $scope.contact.country,
                        "phone": $scope.contact.phone,
                        "agent": $scope.refAgent ? $scope.refAgent.id : ''
                    },
                    "agent": $scope.refAgent ? $scope.refAgent.id : '',
                    "agentCommission": $scope.agent_commission,
                    "discount": $scope.discount.id,
                    "discountPercentage": $scope.discount.percent,
                    "discountAmount": $scope.discountPrice,
                    "checkin": moment.utc($scope.checkin, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
                    "checkout": moment.utc($scope.checkout, CONFIG.DEFAULT_DATE_FORMAT).startOf('day').unix(),
                    "status": 0,
                    "currency": _.findWhere($rootScope.currencies, {
                        "currency": localStorage.getItem('currency')
                    }).id,
                    "priceDay": $scope.priceDay,
                    "created": moment().utc().unix(),
                    "paymentType": 1,
                    "priceExtra": [{
                        "name": "Final cleaning",
                        "calc": "1 x " + $scope.property.cleanfinalprice,
                        "price": $scope.property.cleanfinalprice
                    }],
                    "utilitiesElectricity": $scope.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us",
                    "utilitiesWater": $scope.nights > 6 ? "Paid by tenant at Check-out" : "Paid by us",
                    "utilitiesWifi": "Included",
                    "utilitiesCable": "Included BTV",
                    "rate": 1,
                    "cleanfinalprice": $scope.property.cleanfinalprice,
                    "cleanprice": $scope.property.cleanprice,
                    "expires": expTime,
                    "nights": $scope.nights,
                    "pricePaid": 0,
                    "emails": [],
                    "priceReservation": reservation,
                    "priceSecurity": deposit,
                    "source": 'T'
                };

                console.log("BOOKING DATA : ", $scope.contact);

                Booking.newBooking(booking).then(function (result) {
                    console.log("Booking new go go go!", result);
                    //set booking selected country to ls
                    localStorage.setItem('past-booking-country', $scope.contact.country);
                    localStorage.setItem('past-booking-id', result.data.id);
                    /** Save Booking id when refresh page */
                    Locale.deleteDates();
                    var emailParams = {
                        booking: result.data.id,
                        subject: 'Your booking at ' + $scope.property.name,
                        language: $rootScope.language
                    };

                    $http.post(CONFIG.HELPER_URL + '/booking/setBooking/', {


                        checkin: moment($scope.checkin).format('YYYY-MM-DD'),
                        checkout: moment($scope.checkout).format('YYYY-MM-DD'),
                        user: $scope.contact.name,
                        userEmail: $scope.contact.email,
                        userPhone: $scope.contact.phone,
                        userCountry: $scope.contact.country,
                        totalPrice: $scope.price.priceTotal,
                        deposit: deposit,
                        th_id: result.id,
                        prop: $scope.property.property.unique,
                        status: 0
                    }).success(function (data) {
                        console.log("DATA FROM BEDS24 about this booking :", data);
                        console.log("IF Book");
                    }, error(function (err) {
                        console.log( $scope.property.unique);
                        console.log("booking-post", err);
                    }));
                    //Email.send('booking_confirmation', emailParams); Sending booking email to tenant. not used for now
                    $scope.bookingID = result.data.id;
                    //Modal.newBooking($scope.contact.email, result.data.id);
                });
            };
        }]);
})();
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
(function () {
    "use strict";
    angular.module('ThaiHome')
        .factory("Checklist", ['CONFIG', '$http', '$q', '$templateCache', '$rootScope', function (CONFIG, $http, $q, $templateCache, $rootScope) {
            return {
                add: function (params) {
                    var d = $q.defer();
                    $http.post(CONFIG.API_URL + '/checklist/', params).then(function (result) {
                        d.resolve(result.data);
                    });
                    return d.promise;
                },
                copy: function (params) {
                    var d = $q.defer();
                    $http.post("http://191.101.12.128:3001/checklist/copyChecklistForProperty", params).then(function (result) {
                        d.resolve(result.data);
                    });
                    return d.promise;
                },
                update: function (params) {
                    var d = $q.defer();
                    $http.put(CONFIG.API_URL + '/checklist/' + params.id, params).then(function (result) {
                        d.resolve(result.data);
                    });
                    return d.promise;
                },
                list: function () {
                    var d = $q.defer();
                    $http.get(CONFIG.API_URL + '/checklist').then(function (result) {
                        d.resolve(result.data);
                    });
                    return d.promise;
                },
                delete: function (id) {
                    var d = $q.defer();
                    $http.delete(CONFIG.API_URL + '/checklist/' + id).then(function (result) {
                        d.resolve(result.data);
                    });
                    return d.promise;
                },

            };
        }]);
})();

(function () {
    "use strict";
    angular.module('ThaiHome')
        .factory("Chacklistcategory", ['CONFIG', '$http', '$q', '$templateCache', '$rootScope', function (CONFIG, $http, $q, $templateCache, $rootScope) {
            return {
                add: function (params) {
                    var d = $q.defer();
                    $http.post(CONFIG.API_URL + '/checklistcategory/', params).then(function (result) {
                        d.resolve(result.data);
                    });
                    return d.promise;
                },
                update: function (params) {
                    var d = $q.defer();
                    $http.put(CONFIG.API_URL + '/checklistcategory/' + params.id, params).then(function (result) {
                        d.resolve(result.data);
                    });
                    return d.promise;
                },
                list: function () {
                    var d = $q.defer();
                    $http.get(CONFIG.API_URL + '/checklistcategory').then(function (result) {
                        d.resolve(result.data);
                    });
                    return d.promise;
                },
                delete: function (id) {
                    var d = $q.defer();
                    $http.delete(CONFIG.API_URL + '/checklistcategory/' + id).then(function (result) {
                        d.resolve(result.data);
                    });
                    return d.promise;
                }
            };
        }]);
})();

(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory('CONFIG', ['ENV', function (ENV) {

      var config = ENV;
      return config;

    }]);

})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('contact', {
        url: '/contact/',
        title: 'title_contact',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/contact/index.html');
        },
        controller: 'ContactCtrl',
        resolve: {
          currentUser: ['Auth', '$q', function (Auth, $q) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              d.resolve(data);
            }).catch(function () {
              d.resolve();
            });

            return d.promise;
          }],
          Message: ['Contact', '$q', 'Auth', function (Contact, $q, Auth) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              return Contact.getMessage(null, data.data.id, null);
            }).then(function (data) {
              d.resolve(data);
            });

            return d.promise;
        }]

        }
      });
    }])
    .controller('ContactCtrl', ['Contact', 'Auth', 'Modal', '$http', '$scope', '$rootScope', 'CONFIG', 'currentUser', 'Message', '$timeout', function (Contact, Auth, Modal, $http, $scope, $rootScope, CONFIG, currentUser, Message, $timeout) {
      $scope.chatdisabled = false;
      $scope.focusChat = function () {
        $timeout(function () {
          jQuery('form[name=contact-form] textarea').focus();
          jQuery("form[name=contact-form] input[value='']:not(:checkbox,:button):visible:first").focus();
        }, 500);
      };
      if (currentUser.data) {
        $scope.contact = {};
        $scope.contact.name = currentUser.data.name;
        $scope.contact.email = currentUser.data.email;
        $scope.contact.message = '';
      } else {
        $scope.contact = {};
      }
      if (!_.isEmpty(Message)) {
        $scope.messages = Message;
      } else {
        $scope.messages = {};
      }


      $scope.getDay = function (timestamp) {
        return Contact.getDay(timestamp);
      };


      $scope.askQuestion = function () {
        $scope.chatdisabled = true;
        Contact.askQuestion($scope.contact).then(function (messages) {
          $scope.messages = messages;
          Modal.messageReceived();
          $scope.contact.message = '';
          $scope.chatdisabled = false;
        });
      };
      }])
    .factory('Contact', ['$q', '$http', 'CONFIG', 'User', 'Notification', '$timeout', '$rootScope', function ($q, $http, CONFIG, User, Notification, $timeout, $rootScope) {

      function getMessage(id, tenant, agent) {
        var d = $q.defer();
        var query = {};
        var fullMessages;
        if (id) {
          query.id = id;
        } else if (tenant) {
          query.user = tenant;
        } else if (agent) {
          query.user = agent;
        } else {
          d.resolve({});
        }
        $http.get(CONFIG.API_URL + '/getmessage', {
          params: query
        }).then(function (data) {
          if (data.data) {
            fullMessages = data.data;

            var subMessages = _.sortBy(fullMessages.messages, 'date');

            fullMessages.messages = subMessages;
          } else {
            fullMessages = {};
          }
          $timeout(function () {
            if(typeof $('.smaller-chat')[0] != 'undefined' ) {
                $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
            }
          }, 1000);
          d.resolve(fullMessages);
        }).catch(function () {
          d.resolve({});
        });
        return d.promise;
      }

      function getDay(timestamp) {

        return moment(timestamp, 'X').format('YYYY-MM-DD');
      }

      function cleanMessages(messages) {
        var d = $q.defer();
        var sendMessages = _.after(messages.messages.length, function () {
          var newMessage;
          newMessage = messages;
          newMessage.messages = cleanM;
          d.resolve(newMessage);
        });
        var cleanM = [];
        _.each(messages.messages, function (message) {
          if (_.isObject(message.booking)) {
            message.booking = message.booking.id;
          }
          if (_.isObject(message.property)) {

            message.property = message.property.id;
          }
          cleanM.push(message);
          sendMessages();
        });

        return d.promise;
      }

      function replyQuestion(fullMessage, message, booking) {
        $('#contact_submit_button').prop('disabled', true);
        Notification.info({
          message: '<span>Posting your message...</span>',
          delay: 2000
        });

        $timeout(function () {
          $('body .ui-notification').addClass('notification_message');
        }, 100);
        var d = $q.defer();
        var newMessage = {
          message: message,
          date: moment().unix(),
          manager: true,
          property: null,
          booking: booking
        };
        fullMessage.read = true;
        fullMessage.messages.push(newMessage);

        $http.post(CONFIG.API_URL + '/message/', fullMessage).then(function (message) {
          $('#contact_submit_button').prop('disabled', false);
          $timeout(function () {
            $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
            $('chat textarea:first').focus();
          }, 1000);
          d.resolve(message.data);
        });

        var booking='';
        var property='';
        _.each(fullMessage.messages, function (message) {
          if (message.booking !== undefined && message.booking !== null && message.booking.id !== undefined && message.booking.id !== null) {
            booking = message.booking.id;
          }
          if (message.property !== undefined && message.property !== null && message.property.unique !== undefined && message.property.unique !== null) {
            property = message.property.unique;
          }
        });

        var params = {
          language: $rootScope.language,
          message: fullMessage.id,
          property: property,
          booking: booking
        };

		var i=0;
		_.each(fullMessage.messages,function(msg){
			if(msg.manager){
				i++;
			}
		});

		/*
		* 2016-05-18 - Ajay
		* Email sent on manager's first reply and update last email time in user
		*/
  		if(i==1){
  			$timeout(function () {
  				$http.get(CONFIG.API_URL + /email/, {
  					params: params
  				});
  				$http.put(CONFIG.API_URL + '/users/'+fullMessage.user.id, {lastMessengerMail: Date.now()});
  			}, 1500);
  		}
        return d.promise;
      }

      function askQuestion(contact, manager, property, booking) {
        $('#contact_submit_button').prop('disabled', true);
        Notification.info({
          message: '<span>Posting your message...</span>',
          delay: 2000
        });

        $timeout(function () {
          $('body .ui-notification').addClass('notification_message');
        }, 100);
        var d = $q.defer();

        var newMessage = {
          message: contact.message,
          date: moment().unix(),
          manager: manager ? true : false,
          property: property ? property : null,
          booking: booking ? booking : null
        };

        var newUser = {
          "name": contact.name,
          "email": contact.email
        };
        var userID;

        User.getOne(contact.email, newUser).then(function (currentUser) {
          userID = currentUser;
          return currentUser;
        }).then(function () {
          if (!$rootScope.agent) {
            return User.autoLoginTenant(contact.email);
          }
          return true;
        }).then(function () {
          return getMessage(null, userID, null).then(function (data) {
            if (data.id) {
              var existingMessage = data;
              existingMessage.read = false;
              existingMessage.messages.push(newMessage);
              cleanMessages(existingMessage).then(function (cleanMessage) {
                return $http.put(CONFIG.API_URL + '/message/' + cleanMessage.id, cleanMessage);
              }).then(function () {
                return getMessage(null, userID, null);
              }).then(function (data) {
                $('#contact_submit_button').prop('disabled', false);
                $timeout(function () {
                  $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
                  $('chat textarea:first').focus();
                }, 1000);
                d.resolve(data);
              });

            } else {
              var fullMessage = {
                read: false,
                user: userID,
                messages: [newMessage]
              };
              cleanMessages(fullMessage).then(function () {
                return $http.post(CONFIG.API_URL + '/message/', fullMessage);
              }).then(function () {
                return getMessage(null, userID, null);
              }).then(function (data) {
                $('#contact_submit_button').prop('disabled', false);
                d.resolve(data);
              });
            }
          });
        });
        return d.promise;

      }

      function getUnread(options) {
        var d = $q.defer();
        $http.get(CONFIG.API_URL + '/getmessage', {
          params: {
            //read: false,
            $skip: options.skip || 0,
            $limit: options.limit || 25,
            $sort: options.sort || {}
          }
        }).then(function (data) {

          d.resolve(data.data);
        }).catch(function () {
          d.resolve([]);
        });

        return d.promise;
      }

      function getUnreadCount() {
        var d = $q.defer();
        $http.get(CONFIG.API_URL + '/message/count', {
          params: {
            read: false
          }
        }).then(function (data) {
          d.resolve(data.data.count);
        }).catch(function () {
          d.resolve([]);
        });

        return d.promise;
      }

		function delAllMsg(data) {
			var d = $q.defer();
			$http.post(CONFIG.API_URL + '/deleteall',data).then(function (data) {
			  d.resolve(data);
			}).catch(function (e) {
			  d.reject(e);
			});
			return d.promise;
		}
		function deleteMessage(data) {
			var d = $q.defer();
			$http.delete(CONFIG.API_URL + '/message/'+data).then(function (data) {
			  d.resolve(data);
			}).catch(function (e) {
			  d.reject(e);
			});
			return d.promise;
		}

       function getAllMessages() {
        var d = $q.defer();
        $http.get(CONFIG.API_URL + '/message', {}).then(function (data) {
          d.resolve(data.data);
        }).catch(function () {
          d.resolve([]);
        });

        return d.promise;
      }

	  function latestUnread(message) {
        var m = _.sortBy(message.messages, 'date');
        //m = m.reverse();
        var index = _.findLastIndex(m, {
          manager: false
        });

        return m[index];
      }

	  function readMessage(id) {
		return $http.put(CONFIG.API_URL + '/message/'+id, {read:true});
      }

      return {
        getMessage: getMessage,
        getAllMessages: getAllMessages,
        askQuestion: askQuestion,
        cleanMessages: cleanMessages,
        getDay: getDay,
        getUnread: getUnread,
        replyQuestion: replyQuestion,
        getUnreadCount: getUnreadCount,
        latestUnread: latestUnread,
        deleteAllMessage: delAllMsg,
        delete: deleteMessage,
        readMessage: readMessage
      };

          }])
    .directive('chat', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/thaihome/contact/chat.html');
        }
      };
  }]);
})();

(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory('Countries', [function () {

      var list = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, The Democratic Republic of the", "Cook Islands", "Costa Rica", "CÃ´te d'Ivoire", "Croatia", "Cuba", "CuraÃ§ao", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran, Islamic Republic of", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia, Republic Of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestine, State of", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint BarthÃ©lemy", "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin (French Part)", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten (Dutch Part)", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Viet Nam", "Virgin Islands, British", "Virgin Islands, U.S.", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"];

      return {
        list: list
      };

    }])

})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('Currency', ['$http', 'CONFIG', '$q', function ($http, CONFIG, $q) {
      return {
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/currency', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/currency', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/currency/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/currency/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/currency/' + id).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        }
      };
    }]);
})();
(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("Discount", ['CONFIG', 'User', '$q', 'dpd', '$http', function (CONFIG, User, $q, dpd, $http) {
      return {
        getDiscount: function (code, user, property) {
          var d = $q.defer();
          dpd.discount.get({
            $or: [
              {
                "user": user,
                "property": property,
                "code": code.toUpperCase(),
            },
              {
                "property": null,
                "user": user,
                "code": code.toUpperCase(),
            },
              {
                "user": null,
                "property": property,
                "code": code.toUpperCase(),
            },
              {
                "user": null,
                "property": null,
                "code": code.toUpperCase()
              }
          ],
            $limit: 1
          }).success(function (data) {
            d.resolve(data);
          });

          return d.promise;
        },
        find: function (query) {
          var d = $q.defer();
          dpd.discount.get(query).then(function (data) {
            if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.resolve({});
            }
          });

          return d.promise;
        },
        findAll: function (query) {
          var d = $q.defer();
          dpd.discount.get(query).then(function (data) {
            if (data.data.length) {
              d.resolve(data.data);
            } else {
              d.resolve({});
            }
          });

          return d.promise;
        },
        generate: function (email, booking) {
          var d = $q.defer();

          User.getOne(email, {}, true).then(function (user) {
            return user;
          }).then(function (user) {
            var rating = {
              expires: moment().add(1, 'year').unix(),
              promotion: "Rating Generated",
              percent: 5,
              user: user.id,
              code: user.name.split(' ')[0] + '' + booking.slice(-3).toString(),
              note: "Booking " + booking,
              booking: booking
            };
            dpd.discount.post(rating).success(function (rating) {
              d.resolve(rating);
            });
          });

          return d.promise;

        },
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/discount', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/discount', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/discount/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/discount/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/discount/', {
            params: {
              details: true,
              id: id
            }
          }).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        }
      };
    }])
    .directive("discount", ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/thaihome/discount/index.html');
        }
      };
	}]);

})();

(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("Email", ['CONFIG', '$http', '$q', '$templateCache', '$rootScope', function (CONFIG, $http, $q, $templateCache, $rootScope) {
      return {
        send: function (type, params) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/email/' + type, params).then(function (result) {
            if (params.preview) {
              d.resolve(result.data);
            } else if (result.data.status === 'sent') {
              d.resolve(true);
            } else {
              d.reject(result);
            }
          });
          return d.promise;
        },
        list: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/emails').then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        getHTML: function (type) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/email/' + type, params).then(function (result) {
            if (params.preview) {
              d.resolve(result.data);
            } else if (result.data.status === 'sent') {
              d.resolve(true);
            } else {
              d.reject(result);
            }
          });
          return d.promise;
        }
      };
    }]);
})();
(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("Expenses", ['CONFIG', '$http', '$q', '$templateCache', '$rootScope', function (CONFIG, $http, $q, $templateCache, $rootScope) {
      return {
        add: function (params) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/expense/', params).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        update: function (params) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/expense/' + params.id, params).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        getAll: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/expense/').then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/expense/' + id).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        }
      };
    }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .directive('footer', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/thaihome/footer/index.html');
        }
      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .service('gMaps', ["_", "$rootScope", "$filter", function (_, $rootScope, $filter) {


      this.loadMap = function () {

        var map;

        google.maps.event.addDomListener(window, 'load', function () {
          var location = new google.maps.LatLng(12.919012, 100.904330);
          map = new google.maps.Map($('#map-canvas'), {
            center: location,
            zoom: 13
          });

        });
      };

      this.propertyMap = function (map, data) {
        var location = new google.maps.LatLng(data.gmapsdata.split(',')[0], data.gmapsdata.split(',')[1]);
        map.setCenter(location);
        map.setZoom(15);
        map.setOptions({
          'scrollwheel': false
        });
        var name = data.name;
        var mapPopup = '<style>hr{margin:10px 0;} .map-img-container h3 {margin-bottom:10px;}.address{font-size:10px}h2{font-size:16px;margin: 0;}h3,p{margin:0}h3{font-size:14px}h3,h4{color:#537cb4;margin-bottom:0}hr{border:none;border-bottom:1px solid #DADADA}.clear{clear:both}.booked,.free{float:left;clear:left;}.free{color:green}.booked{color:red}.map-attachment{width:210px;position:relative;padding-right:15px;overflow:hidden}.price,.score{float:left}.score{margin-top:0;margin-right:10px;font-size:12px;}.map-btn:focus{outline:0}.map-img-container{float:left;margin-right:15px;}.map-text-container{float:right;width:98px;}.map-text-container .price b{color:green;font-size:13px;}.price{clear:left;float:left;margin:0}</style><div class="map-attachment"><h2>' + name + '</h2><span class="address">' + data.address2 + ', ' + data.address3 + '</span><hr>';

        mapPopup += '<div><div class="map-img-container"><img class="map-img" height="60" width="80" src="/assets/images/property/' + data.unique.toLowerCase() + '/' + data.featured + '" alt=""></div><div class="map-text-container"><h3>' + data.unique + '</h3></a><h4 class="score">' + (data.stars != null ? data.stars + ' / 5' : '') + '</h4></div></div><div class="clear"></div><hr>';

        var infowindow = new google.maps.InfoWindow({
          content: mapPopup
        });

        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(data.gmapsdata.split(',')[0], data.gmapsdata.split(',')[1]),
          icon: '/assets/images/house-icon-free.png',
          title: name,
          map: map
        });
        marker.addListener('click', function () {
          infowindow.open(map, marker);
        });
      };

      this.searchMap = function (map, freeProperties, bookedProperties, prices) {
        var markers = {};
        var markersAdded = [];
        var marker;
        var content;
        var prev_infowindow = false;
        var infowindow;
        var location = new google.maps.LatLng(12.919012, 100.904330);
        map.setCenter(location);
        map.setZoom(12);
        _.each(freeProperties, function (fp) {
          if (!markers[fp.id]) {
            markers[fp.name] = '<style>hr{margin:10px 0;} .map-img-container h3 {margin-bottom:10px;}.address{font-size:10px}h2{font-size:16px;margin: 0;}h3,p{margin:0}h3{font-size:14px}h3,h4{color:#537cb4;margin-bottom:0}hr{border:none;border-bottom:1px solid #DADADA}.clear{clear:both}.booked,.free{float:left;clear:left;}.free{color:green}.booked{color:red}.map-attachment{width:210px;position:relative;padding-right:15px;overflow:hidden}.price,.score{float:left}.score{margin-top:0;margin-right:10px;font-size:12px;}.map-btn:focus{outline:0}.map-img-container{float:left;margin-right:15px;}.map-text-container{float:right;width:98px;}.map-text-container .price b{color:green;font-size:13px;}.price{clear:left;float:left;margin:0}</style><div class="map-attachment"><h2>' + fp.name + '</h2><span class="address">' + fp.address2 + ', ' + fp.address3 + '</span><hr>';
          }
          markers[fp.name] += '<div><div class="map-img-container"><a href="/#/property/' + fp.unique + '//" target="_blank"><img class="map-img" height="60" width="80" src="/assets/images/property/' + fp.unique.toLowerCase() + '/' + fp.featured + '" alt=""></a></div><div class="map-text-container"><a href="/#/property/' + fp.unique + '//" target="_blank"><h3>' + fp.unique + '</h3></a><h4 class="score">' + (fp.ratingavg != null ? fp.ratingavg + ' / 5' : '') + '</h4><p class="price"><b>' + $filter('currency')(prices[fp.id] ? prices[fp.id].price : 0, $rootScope.currency, 0) + '</b></p><p class="free">Available</p><div class="clear"><a href="/#/property/' + fp.unique + '//" target="_blank" target="_blank"><button class="map_book_button">Book</button></a></div></div></div><div class="clear"></div><hr>';
        });


        _.each(bookedProperties, function (bp) {
          if (!markers[bp.id]) {
            markers[bp.name] = '<style>hr{margin:10px 0;} .map-img-container h3 {margin-bottom:10px;}.address{font-size:10px}h2{font-size:16px;margin: 0;}h3,p{margin:0}h3{font-size:14px}h3,h4{color:#537cb4;margin-bottom:0}hr{border:none;border-bottom:1px solid #DADADA}.clear{clear:both}.booked,.free{float:left;clear:left;}.free{color:green}.booked{color:red}.map-attachment{width:210px;position:relative;padding-right:15px;overflow:hidden}.price,.score{float:left}.score{margin-top:0;margin-right:10px;font-size:12px;}.map-btn:focus{outline:0}.map-img-container{float:left;margin-right:15px;}.map-text-container{float:right;width:98px;}.map-text-container .price b{color:green;font-size:13px;}.price{clear:left;float:left;margin:0}</style><div class="map-attachment"><h2>' + bp.name + '</h2><span class="address">' + bp.address2 + ', ' + bp.address3 + '</span><hr>';
          }
          markers[bp.name] += '<div><div class="map-img-container"><a href="/#/property/' + bp.unique + '//" target="_blank"><img class="map-img" height="60" width="80" src="/assets/images/property/' + bp.unique.toLowerCase() + '/' + bp.featured + '" alt=""></a></div><div class="map-text-container"><h3><a href="/#/property/' + bp.unique + '//" target="_blank">' + bp.unique + '</a></h3><h4 class="score">' + (bp.ratingavg != null ? bp.ratingavg + ' / 5' : '') + '</h4><p class="price"><b>' + $filter('currency')(prices[bp.id] ? prices[bp.id].price : 0, $rootScope.currency, 0) + '</b></p><p class="booked">Booked</p></div></div><div class="clear"></div><hr>';
        });

        _.each(freeProperties, function (fp) {
          if (!markersAdded[fp.name]) {
            marker = new google.maps.Marker({
              position: new google.maps.LatLng(parseFloat(fp.gmapsdata.split(',')[0]), parseFloat(fp.gmapsdata.split(',')[1])),
              icon: '/assets/images/house-icon-free.png',
              title: fp.name,
              map: map
            });
            markersAdded[fp.name] = true;

            infowindow = new google.maps.InfoWindow({
              content: markers[fp.name]
            });
            content = markers[fp.name];

            google.maps.event.addListener(marker, 'click', (function (marker, content, infowindow) {
              return function () {
                if (prev_infowindow) {
                  prev_infowindow.close();
                }

                prev_infowindow = infowindow;
                infowindow.setContent(content);
                infowindow.open(map, marker);
              };
            })(marker, content, infowindow));
          }
        });

        _.each(bookedProperties, function (bp) {
          if (!markersAdded[bp.name]) {
            marker = new google.maps.Marker({
              position: new google.maps.LatLng(parseFloat(bp.gmapsdata.split(',')[0]), parseFloat(bp.gmapsdata.split(',')[1])),
              icon: '/assets/images/house-icon-free.png',
              title: bp.name,
              map: map
            });
            markersAdded[bp.name] = true;

            infowindow = new google.maps.InfoWindow({
              content: markers[bp.name]
            });
            content = markers[bp.name];

            google.maps.event.addListener(marker, 'click', (function (marker, content, infowindow) {
              return function () {
                if (prev_infowindow) {
                  prev_infowindow.close();
                }

                prev_infowindow = infowindow;
                infowindow.setContent(content);
                infowindow.open(map, marker);
              };
            })(marker, content, infowindow));
          }
        });

      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .directive('propertySnippet', ['$templateCache', function ($templateCache) {
      return {
        scope: false,
        restrict: 'AE',
        transclude: true,
        template: function () {
          return $templateCache.get('templates/thaihome/google-search-snippet/property.html');
        }
      };
  }]);
})();
(function () {
    'use strict';
    angular.module('ThaiHome')
    .directive('header',['$templateCache',function($templateCache){
        return {
            restrict: 'AE',
            template: function(){
                return $templateCache.get('templates/thaihome/header/index.html');
            }
        }
    }]);
})();
(function () {
    'use strict';
    angular.module('ThaiHome')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('home', {
                url: '/',
                title: 'title_home',
                css: '/css/style.css',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/thaihome/home/index.html');
                },
                controller: 'HomeCtrl',
                resolve: {
                    CurrentNews: ['News', '$q', function (News, $q) {
                        var deferred = $q.defer();
                        News.getNews().then(function (data) {
                            deferred.resolve(data);
                        }).catch(function (err) {
                            deferred.reject(err, 404);
                        });
                        return deferred.promise;
                    }],
                    // CurrentHotDeals: ["HotDeals", "$q", function (HotDeals, $q) {
                    //     var deferred = $q.defer();
                    //     HotDeals.getDeals().then(function (data) {
                    //         deferred.resolve(data);
                    //     }).catch(function (err) {
                    //         deferred.reject(err, 404);
                    //     });
                    //     return deferred.promise;
                    // }],
                    Locations: ["$q", "$http", "CONFIG", function ($q, $http, CONFIG) {
                        var deferred = $q.defer();
                        $http.get(CONFIG.API_URL + '/location').then(function (data) {
                                deferred.resolve(data);
                            })
                            .catch(function (err) {
                                deferred.reject(err, 404);
                            });
                        return deferred.promise;
                    }],
                }
            })
        }])
        .controller('HomeCtrl', ['$state', 'CurrentNews', '$rootScope', '$interval', '$http', 'Calendar', '$scope', 'CONFIG', 'Locations', 'Locale', '$sce', 'HotDeals', '$timeout',
            function ($state, CurrentNews, $rootScope, $interval, $http, Calendar, $scope, CONFIG, Locations, Locale, $sce, HotDeals, $timeout) {

                var dates = Locale.getDates();
                if (dates.valid) {
                    $scope.checkin = dates.checkin;
                    $scope.checkout = dates.checkout;
                }

                $http({
                    method: "GET",
                    url: CONFIG.HELPER_URL + "/news/getNewsForHomePage"
                }).then(function (data) {
                    console.log(" NEWS DATA", data);
                    $scope.news = data.data.news;
                });

                $scope.deliberatelyTrustDangerousSnippet = function (text) {
                    return $sce.trustAsHtml(text);
                };

                $rootScope.$on("datesChanged", function (event, dates) {
                    $scope.checkin = dates.checkin;
                    $scope.checkout = dates.checkout;
                })


                Calendar.loadCalendar();

                function getDeals() {
                    console.log(' get deals ff ; : ', localStorage.getItem('locale'));
                    if (localStorage.getItem('locale') == null) {
                        console.log(" NEW QUERY FOR DEASL ::");
                        $timeout(function () {
                            getDeals()
                        }, 1000)
                    } else {
                        HotDeals.getDeals().then(function (data) {
                            // console.log(" DATA FROM deals : ", data);
                            //console.log("Price : ",data.data.prices);
                            //New Function add price to data.data.price
                            angular.forEach(data.data.prices, function (value, key) {
                                //loop find price 
                                var start = new Date(); //start date
                                var end = new Date();
                                end.setDate(end.getDate() + 1); //end date
                                var url = CONFIG.HELPER_URL + "/price/getPrice/";
                                var connect = {
                                    method: 'POST',
                                    url: url,
                                    data: {
                                        "propertyID": key,
                                        "checkin": Date.parse(start) / 1000,
                                        "checkout": Date.parse(end) / 1000
                                    }
                                }
                                $http(connect).then(function (response) {
                                    console.log(response.data.priceFindResult);
                                    value.price.push({
                                        property: key,
                                        season: "base",
                                        priceDay: response.data.priceFindResult.priceNight
                                    });
                                }, function (err) {
                                    console.log(err);
                                });

                            })
                            $scope.HotDeals = {
                                "properties": data.data.properties,
                                "prices": data.data.prices,
                                "hotdeals": data.data.hotdeals,
                                "translations": data.data.translations
                            };
                        });
                    }
                }

                getDeals();


                $scope.locations = Locations.data;

                $scope.headerSlider = function () {

                    $http.get(CONFIG.API_URL + "/featured")
                        .success(function (response) {
                            var images = response;
                            $('.home-bg img').attr('src', '/assets/images/rotator/' + images[0].image);
                            for (var i = 0; i < images.length; i++) {
                                $('body').append('<img src="/assets/images/rotator/' + images[i].image + '" style="display:none"/>');
                            }
                            if ($rootScope.rotator != true) {
                                var key = 1;
                                $rootScope.rotator = true;
                                var slider = $interval(function () {
                                    $('.home-bg img').animate({
                                        opacity: 0.5
                                    }, '500', function () {
                                        $(this)
                                            .attr('src', '/assets/images/rotator/' + images[key].image)
                                            .animate({
                                                opacity: 1
                                            }, '100');
                                    });
                                    key++;
                                    if (key == images.length) {
                                        key = 0
                                    }
                                }, CONFIG.HOME_IMAGE_TIMEOUT);
                            }

                        });

                }

                $scope.search = function () {
                    //Moment Error fix

                    if (!$scope.checkin || !$scope.checkout) {
                        $scope.checkin = moment().add(30, 'days').format("MMM D, YYYY");
                        $scope.checkout = moment().add(37, 'days').format("MMM D, YYYY");
                        localStorage.setItem('checkin', moment().add(30, 'days').format("MMM D, YYYY"));
                        localStorage.setItem('checkout', moment().add(37, 'days').format("MMM D,  YYYY"));
                        $('.arrival, .departure').data('dateRangePicker').setDateRange($scope.checkin, $scope.checkout);

                        $scope.search();
                    }

                    $state.go('search', {
                        "location": $scope.location ? $scope.location : 0
                    });
                }

            }
        ])
})();
(function () {
    "use strict";
    angular.module('ThaiHome')
        .factory("HotDeals", ["$http", "$q", "CONFIG", "Locale", function ($http, $q, CONFIG, Locale) {
            return {
                getDeals: function () {
                    var lng = '';
                    if (localStorage.getItem('locale')) {
                        lng = localStorage.getItem('locale');
                    } else {
                        lng = 'gb';
                    }
                    var defer = $q.defer();
                    var dates = Locale.getDates();
                    var params = {};

                    if (dates.valid) {
                        params = {
                            checkin: dates.checkin,
                            checkout: dates.checkout,
                            format: CONFIG.DEFAULT_DATE_FORMAT,
                            lng: lng
                        };
                    }
                    $http.get(CONFIG.API_URL + '/hotdeals', {
                        params: params
                    })
                        .then(function (response) {
                            defer.resolve(response);
                        }, function (err) {
                            defer.reject(err);
                        });

                    return defer.promise;

                },
                getAll: function (query) {
                    var d = $q.defer();
                    $http.get(CONFIG.API_URL + '/hotdeal', {
                        params: query
                    }).then(function (data) {
                        d.resolve(data.data);
                    }).catch(function (err) {
                        d.reject(err);
                    });

                    return d.promise;
                },
                add: function (data) {
                    var d = $q.defer();
                    $http.post(CONFIG.API_URL + '/hotdeal', data).then(function (data) {
                        d.resolve(data);
                    }).catch(function (err) {
                        d.reject(err);
                    });
                    return d.promise;
                },
                update: function (id, data) {
                    var d = $q.defer();
                    $http.put(CONFIG.API_URL + '/hotdeal/' + id, data).then(function (data) {
                        d.resolve(data.data);
                    }).catch(function (e) {
                        d.reject(e);
                    });
                    return d.promise;
                },
                delete: function (id) {
                    var d = $q.defer();
                    $http.delete(CONFIG.API_URL + '/hotdeal/' + id).then(function (data) {
                        d.resolve(data);
                    }).catch(function (e) {
                        d.reject(e);
                    });
                    return d.promise;
                },
                getDetails: function (id) {
                    var d = $q.defer();
                    $http.get(CONFIG.API_URL + '/hotdeal/' + id).then(function (data) {
                        if (_.isObject(data.data) && data.data.id) {
                            d.resolve(data.data);
                        } else if (data.data.length) {
                            d.resolve(data.data[0]);
                        } else {
                            d.reject();
                        }
                        return d.promise;
                    });
                    return d.promise;

                }
            };

        }])
        .directive('hotDeals', ['$templateCache', function ($templateCache) {
            return {
                template: function () {
                    return $templateCache.get('templates/thaihome/hot-deals/index.html');
                }
            };
        }]);
})();

(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("Invoice", ['CONFIG', '$http', '$q', '$templateCache', '$rootScope', function (CONFIG, $http, $q, $templateCache, $rootScope) {
      return {
        add: function (params) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/invoice/', params).then(function (result) {
              d.resolve(result.data);
          });
          return d.promise;
        },
        update: function (params) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/invoice/' + params.id, params).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        list: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/invoice').then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/invoice/' + id).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
      };
    }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('IPLocation', ['$http', '$q', 'CONFIG', function ($http, $q, CONFIG) {
      return {
        get: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/getip').then(function (response) {
            d.resolve(response);
          }).catch(function () {
            d.reject();
          });
          return d.promise;
        }
      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('Language', ['$http', 'CONFIG', '$q', function ($http, CONFIG, $q) {
      return {
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/language', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/language', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/language/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/language/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/language/' + id).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        }
      };
    }]);
})();
(function () {
    "use strict";
    angular.module('ThaiHome')
        .factory("CountryToLanguage", ['$rootScope', function ($rootScope) {
            var countryList = [
                {
                    "country": "Afghanistan",
                    "code": "AF",
                    "language": "Dari",
                    "default": "English",
                    "languageCode": "af",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "AFN",
                    "Currency": "Afghani",
                    "Symbol": "AFN"
                },
                {
                    "country": "Albania",
                    "code": "AL",
                    "language": "Albanian",
                    "default": "English",
                    "languageCode": "al",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ALL",
                    "Currency": "Lek",
                    "Symbol": "ALL"
                },
                {
                    "country": "Algeria",
                    "code": "DZ",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "dz",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "DZD",
                    "Currency": "Dinar",
                    "Symbol": "دج"
                },
                {
                    "country": "American Samoa",
                    "code": "AS",
                    "language": "Samoan",
                    "default": "English",
                    "languageCode": "as",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "$"
                },
                {
                    "country": "Andorra",
                    "code": "AD",
                    "language": "Catalan",
                    "default": "Spanish",
                    "languageCode": "ad",
                    "defaultLanguageCode": "es",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Angola",
                    "code": "AO",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "ao",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "AOA",
                    "Currency": "Kwanza",
                    "Symbol": "Kz"
                },
                {
                    "country": "Antigua and Barbuda",
                    "code": "AG",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ag",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Dollar",
                    "Symbol": "EC$"
                },
                {
                    "country": "Argentina",
                    "code": "AR",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "ar",
                    "defaultLanguageCode": "es",
                    "currencyCode": "ARS",
                    "Currency": "Peso",
                    "Symbol": "AR$"
                },
                {
                    "country": "Armenia",
                    "code": "AM",
                    "language": "Armenian",
                    "default": "Russian",
                    "languageCode": "am",
                    "defaultLanguageCode": "am",
                    "currencyCode": "AMD",
                    "Currency": "Dram",
                    "Symbol": "֏"
                },
                {
                    "country": "Aruba",
                    "code": "AW",
                    "language": "Dutch",
                    "default": "Dutch",
                    "languageCode": "aw",
                    "defaultLanguageCode": "nl",
                    "currencyCode": "AWG",
                    "Currency": "Florin",
                    "Symbol": "ƒ"
                },
                {
                    "country": "Australia",
                    "code": "AU",
                    "language": "English",
                    "default": "English",
                    "languageCode": "au",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "AUD",
                    "Currency": "Dollar",
                    "Symbol": "AU$"
                },
                {
                    "country": "Austria",
                    "code": "AT",
                    "language": "German",
                    "default": "German",
                    "languageCode": "at",
                    "defaultLanguageCode": "de",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Azerbaijan",
                    "code": "AZ",
                    "language": "Azerbaijani",
                    "default": "Russian",
                    "languageCode": "az",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "AZN",
                    "Currency": "Manat",
                    "Symbol": "ман"
                },
                {
                    "country": "Bahamas",
                    "code": "BS",
                    "language": "English",
                    "default": "English",
                    "languageCode": "bs",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BSD",
                    "Currency": "Dollar",
                    "Symbol": "BS$"
                },
                {
                    "country": "Bahrain",
                    "code": "BH",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "bh",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "BHD",
                    "Currency": "Dinar",
                    "Symbol": "ب.د"
                },
                {
                    "country": "Bangladesh",
                    "code": "BD",
                    "language": "Bengali",
                    "default": "English",
                    "languageCode": "bd",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BDT",
                    "Currency": "Taka",
                    "Symbol": "৳"
                },
                {
                    "country": "Barbados",
                    "code": "BB",
                    "language": "English",
                    "default": "English",
                    "languageCode": "bb",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BBD",
                    "Currency": "Dollar",
                    "Symbol": "Bds$"
                },
                {
                    "country": "Belarus",
                    "code": "BY",
                    "language": "Belarusian",
                    "default": "Russian",
                    "languageCode": "by",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "BYR",
                    "Currency": "Rubel",
                    "Symbol": "Br"
                },
                {
                    "country": "Belgium",
                    "code": "BE",
                    "language": "Dutch",
                    "default": "English",
                    "languageCode": "be",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Belize",
                    "code": "BZ",
                    "language": "Spanish",
                    "default": "English",
                    "languageCode": "bz",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BZD",
                    "Currency": "Dollar",
                    "Symbol": "BZ$"
                },
                {
                    "country": "Benin",
                    "code": "BJ",
                    "language": "French",
                    "default": "French",
                    "languageCode": "bj",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Bermuda",
                    "code": "BM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "bm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BMD",
                    "Currency": "Dollar",
                    "Symbol": "BD$"
                },
                {
                    "country": "Bhutan",
                    "code": "BT",
                    "language": "Dzongkha",
                    "default": "English",
                    "languageCode": "bt",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BTN",
                    "Currency": "Ngultrum",
                    "Symbol": "Nu"
                },
                {
                    "country": "Bolivia",
                    "code": "BO",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "bo",
                    "defaultLanguageCode": "es",
                    "currencyCode": "BOB",
                    "Currency": "Boliviano",
                    "Symbol": "Bs"
                },
                {
                    "country": "Bosnia Herzegovina",
                    "code": "BA",
                    "language": "Bosnian",
                    "default": "English",
                    "languageCode": "ba",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BAM",
                    "Currency": "Mark",
                    "Symbol": "KM"
                },
                {
                    "country": "Botswana",
                    "code": "BW",
                    "language": "English",
                    "default": "English",
                    "languageCode": "bw",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BWP",
                    "Currency": "Pula",
                    "Symbol": "P"
                },
                {
                    "country": "Brazil",
                    "code": "BR",
                    "language": "Portuguese",
                    "default": "Spanish",
                    "languageCode": "br",
                    "defaultLanguageCode": "es",
                    "currencyCode": "BRL",
                    "Currency": "Real",
                    "Symbol": "R$"
                },
                {
                    "country": "British Indian Ocean Territory",
                    "code": "IO",
                    "language": "English",
                    "default": "English",
                    "languageCode": "io",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "$"
                },
                {
                    "country": "Brunei",
                    "code": "BN",
                    "language": "Malay",
                    "default": "English",
                    "languageCode": "bn",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BND",
                    "Currency": "Dollar",
                    "Symbol": "B$"
                },
                {
                    "country": "Bulgaria",
                    "code": "BG",
                    "language": "Bulgarian",
                    "default": "English",
                    "languageCode": "bg",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "BGN",
                    "Currency": "Lew",
                    "Symbol": "лв"
                },
                {
                    "country": "Burkina Faso",
                    "code": "BF",
                    "language": "French",
                    "default": "French",
                    "languageCode": "bf",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Burundi",
                    "code": "BI",
                    "language": "French",
                    "default": "French",
                    "languageCode": "bi",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "BIF",
                    "Currency": "Franc",
                    "Symbol": "FBu"
                },
                {
                    "country": "Cambodia",
                    "code": "KH",
                    "language": "Khmer",
                    "default": "English",
                    "languageCode": "kh",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "KHR",
                    "Currency": "Riel",
                    "Symbol": "៛"
                },
                {
                    "country": "Cameroon",
                    "code": "CM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "cm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XAF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Canada",
                    "code": "CA",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ca",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "CAD",
                    "Currency": "Dollar",
                    "Symbol": "CA$"
                },
                {
                    "country": "Cape Verde",
                    "code": "CV",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "cv",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "CVE",
                    "Currency": "Escudo",
                    "Symbol": "CV$"
                },
                {
                    "country": "Cayman Islands",
                    "code": "KY",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ky",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "KYD",
                    "Currency": "Cayman-Dollar",
                    "Symbol": "CI$"
                },
                {
                    "country": "Central African Republic",
                    "code": "CF",
                    "language": "French",
                    "default": "French",
                    "languageCode": "cf",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XAF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Chad",
                    "code": "TD",
                    "language": "Arabic",
                    "default": "French",
                    "languageCode": "td",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XAF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Chile",
                    "code": "CL",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "cl",
                    "defaultLanguageCode": "es",
                    "currencyCode": "CLP",
                    "Currency": "Peso",
                    "Symbol": "CL$"
                },
                {
                    "country": "China",
                    "code": "CN",
                    "language": "Chinese",
                    "default": "Chinese",
                    "languageCode": "cn",
                    "defaultLanguageCode": "cn",
                    "currencyCode": "CNY",
                    "Currency": "Yuan",
                    "Symbol": "CN¥"
                },
                {
                    "country": "Christmas Island",
                    "code": "CX",
                    "language": "English",
                    "default": "English",
                    "languageCode": "cx",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "AUD",
                    "Currency": "Dollar",
                    "Symbol": "AU$"
                },
                {
                    "country": "Colombia",
                    "code": "CO",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "co",
                    "defaultLanguageCode": "es",
                    "currencyCode": "COP",
                    "Currency": "Peso",
                    "Symbol": "Col$"
                },
                {
                    "country": "Comoros",
                    "code": "KM",
                    "language": "Arabic",
                    "default": "French",
                    "languageCode": "km",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "KMF",
                    "Currency": "Franc",
                    "Symbol": "KMF"
                },
                {
                    "country": "Congo",
                    "code": "CG",
                    "language": "Swahili",
                    "default": "French",
                    "languageCode": "cg",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "CDF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Costa Rica",
                    "code": "CR",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "cr",
                    "defaultLanguageCode": "es",
                    "currencyCode": "CRC",
                    "Currency": "ColÃ³n",
                    "Symbol": "₡"
                },
                {
                    "country": "Côte d'Ivoire",
                    "code": "CI",
                    "language": "French",
                    "default": "French",
                    "languageCode": "ci",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Croatia",
                    "code": "HR",
                    "language": "Croatian",
                    "default": "English",
                    "languageCode": "hr",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "HRK",
                    "Currency": "Kuna",
                    "Symbol": "HRK"
                },
                {
                    "country": "Cuba",
                    "code": "CU",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "cu",
                    "defaultLanguageCode": "es",
                    "currencyCode": "CUP",
                    "Currency": "Peso",
                    "Symbol": "CU$"
                },
                {
                    "country": "Cyprus",
                    "code": "CY",
                    "language": "Greek",
                    "default": "English",
                    "languageCode": "cy",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "CY£"
                },
                {
                    "country": "Czech Republic",
                    "code": "CZ",
                    "language": "Czech",
                    "default": "English",
                    "languageCode": "cz",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "CZK",
                    "Currency": "Krone",
                    "Symbol": "Kč"
                },
                {
                    "country": "Denmark",
                    "code": "DK",
                    "language": "Danish",
                    "default": "English",
                    "languageCode": "dk",
                    "defaultLanguageCode": "dk",
                    "currencyCode": "DKK",
                    "Currency": "Krone",
                    "Symbol": "ø"
                },
                {
                    "country": "Djibouti",
                    "code": "DJ",
                    "language": "Arabic",
                    "default": "French",
                    "languageCode": "dj",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "DJF",
                    "Currency": "Franc",
                    "Symbol": "Fdj"
                },
                {
                    "country": "Dominica",
                    "code": "DM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "dm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Dollar",
                    "Symbol": "EC$"
                },
                {
                    "country": "Dominican Republic",
                    "code": "DO",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "do",
                    "defaultLanguageCode": "es",
                    "currencyCode": "DOP",
                    "Currency": "Peso",
                    "Symbol": "RD$"
                },
                {
                    "country": "Ecuador",
                    "code": "EC",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "ec",
                    "defaultLanguageCode": "es",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "US$"
                },
                {
                    "country": "Egypt",
                    "code": "EG",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "eg",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "EGP",
                    "Currency": "Pfund",
                    "Symbol": "ج.م"
                },
                {
                    "country": "El Salvador",
                    "code": "SV",
                    "language": "French",
                    "default": "English",
                    "languageCode": "sv",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "US$"
                },
                {
                    "country": "Equatorial Guinea",
                    "code": "GQ",
                    "language": "French",
                    "default": "Spanish",
                    "languageCode": "gq",
                    "defaultLanguageCode": "es",
                    "currencyCode": "XAF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Eritrea",
                    "code": "ER",
                    "language": "Arabic",
                    "default": "English",
                    "languageCode": "er",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ERN",
                    "Currency": "Nakfa",
                    "Symbol": "Nfk"
                },
                {
                    "country": "Estonia",
                    "code": "EE",
                    "language": "Estonian",
                    "default": "English",
                    "languageCode": "ee",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "KR"
                },
                {
                    "country": "Ethiopia",
                    "code": "ET",
                    "language": "Amharic",
                    "default": "English",
                    "languageCode": "et",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ETB",
                    "Currency": "Birr",
                    "Symbol": "Br"
                },
                {
                    "country": "Faroe Islands",
                    "code": "FO",
                    "language": "Faroese",
                    "default": "English",
                    "languageCode": "fo",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "DKK",
                    "Currency": "Krone",
                    "Symbol": "ø"
                },
                {
                    "country": "Fiji",
                    "code": "FJ",
                    "language": "English",
                    "default": "English",
                    "languageCode": "fj",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "FJD",
                    "Currency": "Dollar",
                    "Symbol": "FJ$"
                },
                {
                    "country": "Finland",
                    "code": "FI",
                    "language": "Finnish",
                    "default": "English",
                    "languageCode": "fi",
                    "defaultLanguageCode": "fi",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "France",
                    "code": "FR",
                    "language": "French",
                    "default": "French",
                    "languageCode": "fr",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "French Guiana",
                    "code": "GF",
                    "language": "French",
                    "default": "French",
                    "languageCode": "gf",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "French Polynesia",
                    "code": "PF",
                    "language": "French",
                    "default": "French",
                    "languageCode": "pf",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XPF",
                    "Currency": "Franc",
                    "Symbol": "CFP"
                },
                {
                    "country": "Gabon",
                    "code": "GA",
                    "language": "French",
                    "default": "French",
                    "languageCode": "ga",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XAF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Gambia",
                    "code": "GM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GMD",
                    "Currency": "Dalasi",
                    "Symbol": "D"
                },
                {
                    "country": "Georgia",
                    "code": "GE",
                    "language": "Georgian",
                    "default": "English",
                    "languageCode": "ge",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GEL",
                    "Currency": "Lari",
                    "Symbol": "GEL"
                },
                {
                    "country": "Germany",
                    "code": "DE",
                    "language": "German",
                    "default": "German",
                    "languageCode": "de",
                    "defaultLanguageCode": "de",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Ghana",
                    "code": "GH",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gh",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GHS",
                    "Currency": "Ghana Cedi",
                    "Symbol": "₵"
                },
                {
                    "country": "Greece",
                    "code": "GR",
                    "language": "Greek",
                    "default": "English",
                    "languageCode": "gr",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Greenland",
                    "code": "GL",
                    "language": "Greenlandic",
                    "default": "English",
                    "languageCode": "gl",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "DKK",
                    "Currency": "Krone",
                    "Symbol": "ø"
                },
                {
                    "country": "Grenada",
                    "code": "GD",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gd",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Dollar",
                    "Symbol": "EC$"
                },
                {
                    "country": "Guadeloupe",
                    "code": "GP",
                    "language": "French",
                    "default": "French",
                    "languageCode": "gp",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Guam",
                    "code": "GU",
                    "language": "Spanish",
                    "default": "English",
                    "languageCode": "gu",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "US$"
                },
                {
                    "country": "Guatemala",
                    "code": "GT",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "gt",
                    "defaultLanguageCode": "es",
                    "currencyCode": "GTQ",
                    "Currency": "Quetzal",
                    "Symbol": "Q"
                },
                {
                    "country": "Guinea",
                    "code": "GN",
                    "language": "French",
                    "default": "French",
                    "languageCode": "gn",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "GNF",
                    "Currency": "Pfund",
                    "Symbol": "FG"
                },
                {
                    "country": "Guinea-Bissau",
                    "code": "GW",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "gw",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "XOF",
                    "Currency": "Franc",
                    "Symbol": "franc"
                },
                {
                    "country": "Guyana",
                    "code": "GY",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gy",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GYD",
                    "Currency": "Franc",
                    "Symbol": "GY$"
                },
                {
                    "country": "Haiti",
                    "code": "HT",
                    "language": "French",
                    "default": "French",
                    "languageCode": "ht",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "HTG",
                    "Currency": "Dollar",
                    "Symbol": "G"
                },
                {
                    "country": "Honduras",
                    "code": "HN",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "hn",
                    "defaultLanguageCode": "es",
                    "currencyCode": "HNL",
                    "Currency": "Dollar",
                    "Symbol": "L"
                },
                {
                    "country": "Hong Kong",
                    "code": "HK",
                    "language": "Chinese",
                    "default": "English",
                    "languageCode": "hk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "HKD",
                    "Currency": "Lempira",
                    "Symbol": "HK$"
                },
                {
                    "country": "Hungary",
                    "code": "HU",
                    "language": "Hungarian",
                    "default": "English",
                    "languageCode": "hu",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "HUF",
                    "Currency": "Dollar",
                    "Symbol": "Ft"
                },
                {
                    "country": "Iceland",
                    "code": "IS",
                    "language": "Icelandic",
                    "default": "English",
                    "languageCode": "is",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ISK",
                    "Currency": "Forint",
                    "Symbol": "ISK"
                },
                {
                    "country": "India",
                    "code": "IN",
                    "language": "Hindi",
                    "default": "English",
                    "languageCode": "in",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "INR",
                    "Currency": "Krone",
                    "Symbol": "IN₨"
                },
                {
                    "country": "Indonesia",
                    "code": "ID",
                    "language": "Indonesian",
                    "default": "English",
                    "languageCode": "id",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "IDR",
                    "Currency": "Rupie",
                    "Symbol": "Rp"
                },
                {
                    "country": "Iran",
                    "code": "IR",
                    "language": "Persian",
                    "default": "English",
                    "languageCode": "ir",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "IRR",
                    "Currency": "Rupiah",
                    "Symbol": "ريال"
                },
                {
                    "country": "Iraq",
                    "code": "IQ",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "iq",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "IQD",
                    "Currency": "Rial",
                    "Symbol": "ع.د"
                },
                {
                    "country": "Ireland",
                    "code": "IE",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ie",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Dinar",
                    "Symbol": "€"
                },
                {
                    "country": "Isle of Man",
                    "code": "IM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "im",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "IMP",
                    "Currency": "Euro",
                    "Symbol": "UK£"
                },
                {
                    "country": "Israel",
                    "code": "IL",
                    "language": "Hebrew",
                    "default": "Arabic",
                    "languageCode": "il",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "ILS",
                    "Currency": "Pfund",
                    "Symbol": "₪"
                },
                {
                    "country": "Italy",
                    "code": "IT",
                    "language": "Italian",
                    "default": "English",
                    "languageCode": "it",
                    "defaultLanguageCode": "it",
                    "currencyCode": "EUR",
                    "Currency": "Schekel",
                    "Symbol": "€"
                },
                {
                    "country": "Jamaica",
                    "code": "JM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "jm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "JMD",
                    "Currency": "Euro",
                    "Symbol": "JA$"
                },
                {
                    "country": "Japan",
                    "code": "JP",
                    "language": "Japanese",
                    "default": "Japanese",
                    "languageCode": "jp",
                    "defaultLanguageCode": "jp",
                    "currencyCode": "JPY",
                    "Currency": "Dollar",
                    "Symbol": "JP¥"
                },
                {
                    "country": "Jersey",
                    "code": "JE",
                    "language": "English",
                    "default": "English",
                    "languageCode": "je",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "JEP",
                    "Currency": "Yen",
                    "Symbol": "UK£"
                },
                {
                    "country": "Jordan",
                    "code": "JO",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "jo",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "JOD",
                    "Currency": "Pfund-Sterling",
                    "Symbol": "JD"
                },
                {
                    "country": "Kazakhstan",
                    "code": "KZ",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "kz",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "KZT",
                    "Currency": "Dinar",
                    "Symbol": "KZT"
                },
                {
                    "country": "Kenya",
                    "code": "KE",
                    "language": "Swahili",
                    "default": "English",
                    "languageCode": "ke",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "KES",
                    "Currency": "Tenge",
                    "Symbol": "KSh"
                },
                {
                    "country": "Kiribati",
                    "code": "KI",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ki",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "AUD",
                    "Currency": "Schilling",
                    "Symbol": "AU$"
                },
                {
                    "country": "Kosovo",
                    "code": "XK",
                    "language": "Albanian",
                    "default": "English",
                    "languageCode": "xk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "North Korea",
                    "code": "KP",
                    "language": "Korean",
                    "default": "Korean",
                    "languageCode": "kp",
                    "defaultLanguageCode": "kr",
                    "currencyCode": "KPW",
                    "Currency": "Euro",
                    "Symbol": "₩"
                },
                {
                    "country": "South Korea",
                    "code": "KR",
                    "language": "Korean",
                    "default": "Korean",
                    "languageCode": "kr",
                    "defaultLanguageCode": "kr",
                    "currencyCode": "KRW",
                    "Currency": "Won",
                    "Symbol": "₩"
                },
                {
                    "country": "Kuwait",
                    "code": "KW",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "kw",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "KWD",
                    "Currency": "Won",
                    "Symbol": "د.ك"
                },
                {
                    "country": "Kyrgyzstan",
                    "code": "KG",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "kg",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "KGS",
                    "Currency": "Dinar",
                    "Symbol": "KGS"
                },
                {
                    "country": "Laos",
                    "code": "LA",
                    "language": "Lao",
                    "default": "English",
                    "languageCode": "la",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "LAK",
                    "Currency": "Som",
                    "Symbol": "₭"
                },
                {
                    "country": "Latvia",
                    "code": "LV",
                    "language": "Latvian",
                    "default": "English",
                    "languageCode": "lv",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Kip",
                    "Symbol": "Ls"
                },
                {
                    "country": "Lebanon",
                    "code": "LB",
                    "language": "Arabic",
                    "default": "French",
                    "languageCode": "lb",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "LBP",
                    "Currency": "Euro",
                    "Symbol": "ل.ل"
                },
                {
                    "country": "Lesotho",
                    "code": "LS",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ls",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "LSL",
                    "Currency": "Pfund",
                    "Symbol": "L"
                },
                {
                    "country": "Liberia",
                    "code": "LR",
                    "language": "English",
                    "default": "English",
                    "languageCode": "lr",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "LRD",
                    "Currency": "Loti",
                    "Symbol": "L$"
                },
                {
                    "country": "Libya",
                    "code": "LY",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "ly",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "LYD",
                    "Currency": "Dollar",
                    "Symbol": "ل.د"
                },
                {
                    "country": "Liechtenstein",
                    "code": "LI",
                    "language": "German",
                    "default": "German",
                    "languageCode": "li",
                    "defaultLanguageCode": "de",
                    "currencyCode": "CHF",
                    "Currency": "Dinar",
                    "Symbol": "CHF"
                },
                {
                    "country": "Lithuania",
                    "code": "LT",
                    "language": "Lithuanian",
                    "default": "English",
                    "languageCode": "lt",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "LTL",
                    "Currency": "Franken",
                    "Symbol": "Lt"
                },
                {
                    "country": "Luxembourg",
                    "code": "LU",
                    "language": "German",
                    "default": "French",
                    "languageCode": "lu",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Litas",
                    "Symbol": "€"
                },
                {
                    "country": "Macau",
                    "code": "MO",
                    "language": "Chinese",
                    "default": "Chinese",
                    "languageCode": "mo",
                    "defaultLanguageCode": "cn",
                    "currencyCode": "MOP",
                    "Currency": "Euro",
                    "Symbol": "MO$"
                },
                {
                    "country": "Macedonia",
                    "code": "MK",
                    "language": "Macedonian",
                    "default": "English",
                    "languageCode": "mk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MKD",
                    "Currency": "Pataca",
                    "Symbol": "MKD"
                },
                {
                    "country": "Madagascar",
                    "code": "MG",
                    "language": "French",
                    "default": "French",
                    "languageCode": "mg",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "MGA",
                    "Currency": "Denar",
                    "Symbol": "MGA"
                },
                {
                    "country": "Malawi",
                    "code": "MW",
                    "language": "English",
                    "default": "English",
                    "languageCode": "mw",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MWK",
                    "Currency": "Ariary",
                    "Symbol": "MK"
                },
                {
                    "country": "Malaysia",
                    "code": "MY",
                    "language": "Malay",
                    "default": "English",
                    "languageCode": "my",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MYR",
                    "Currency": "Kwacha",
                    "Symbol": "RM"
                },
                {
                    "country": "Maldives",
                    "code": "MV",
                    "language": "Maldivian",
                    "default": "English",
                    "languageCode": "mv",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MVR",
                    "Currency": "Ringgit",
                    "Symbol": "MRf"
                },
                {
                    "country": "Mali",
                    "code": "ML",
                    "language": "French",
                    "default": "French",
                    "languageCode": "ml",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Rufiyaa",
                    "Symbol": "franc"
                },
                {
                    "country": "Malta",
                    "code": "MT",
                    "language": "English",
                    "default": "English",
                    "languageCode": "mt",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Franc",
                    "Symbol": "Lm"
                },
                {
                    "country": "Marshall Islands",
                    "code": "MH",
                    "language": "English",
                    "default": "English",
                    "languageCode": "mh",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Euro",
                    "Symbol": "US$"
                },
                {
                    "country": "Martinique",
                    "code": "MQ",
                    "language": "French",
                    "default": "French",
                    "languageCode": "mq",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Dollar",
                    "Symbol": "€"
                },
                {
                    "country": "Mauritania",
                    "code": "MR",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "mr",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "MRO",
                    "Currency": "Euro",
                    "Symbol": "UM"
                },
                {
                    "country": "Mauritius",
                    "code": "MU",
                    "language": "French",
                    "default": "English",
                    "languageCode": "mu",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MUR",
                    "Currency": "Ouguiya",
                    "Symbol": "MU₨"
                },
                {
                    "country": "Mayotte",
                    "code": "YT",
                    "language": "French",
                    "default": "French",
                    "languageCode": "yt",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Rupie",
                    "Symbol": "€"
                },
                {
                    "country": "Mexico",
                    "code": "MX",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "mx",
                    "defaultLanguageCode": "es",
                    "currencyCode": "MXN",
                    "Currency": "Euro",
                    "Symbol": "Mex$"
                },
                {
                    "country": "Micronesia",
                    "code": "FM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "fm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Peso",
                    "Symbol": "US$"
                },
                {
                    "country": "Moldova",
                    "code": "MD",
                    "language": "Moldavian",
                    "default": "Romanian",
                    "languageCode": "md",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MDL",
                    "Currency": "Dollar",
                    "Symbol": "MDL"
                },
                {
                    "country": "Monaco",
                    "code": "MC",
                    "language": "French",
                    "default": "French",
                    "languageCode": "mc",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Leu",
                    "Symbol": "€"
                },
                {
                    "country": "Mongolia",
                    "code": "MN",
                    "language": "Mongolian",
                    "default": "English",
                    "languageCode": "mn",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MNT",
                    "Currency": "Euro",
                    "Symbol": "₮"
                },
                {
                    "country": "Montenegro",
                    "code": "ME",
                    "language": "Montenegrin",
                    "default": "English",
                    "languageCode": "me",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "TÃ¶grÃ¶g",
                    "Symbol": "€"
                },
                {
                    "country": "Morocco",
                    "code": "MA",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "ma",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "MAD",
                    "Currency": "Euro",
                    "Symbol": "د.م"
                },
                {
                    "country": "Mozambique",
                    "code": "MZ",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "mz",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "MZN",
                    "Currency": "Dirham",
                    "Symbol": "MTn"
                },
                {
                    "country": "Myanmar",
                    "code": "MM",
                    "language": "Burmese",
                    "default": "English",
                    "languageCode": "mm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "MMK",
                    "Currency": "Metical",
                    "Symbol": "K"
                },
                {
                    "country": "Namibia",
                    "code": "NA",
                    "language": "Afrikaans",
                    "default": "English",
                    "languageCode": "na",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NAD",
                    "Currency": "Kyat",
                    "Symbol": "N$"
                },
                {
                    "country": "Nepal",
                    "code": "NP",
                    "language": "Nepali",
                    "default": "English",
                    "languageCode": "np",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NPR",
                    "Currency": "Dollar",
                    "Symbol": "NP₨"
                },
                {
                    "country": "Netherlands",
                    "code": "NL",
                    "language": "Dutch",
                    "default": "Dutch",
                    "languageCode": "nl",
                    "defaultLanguageCode": "nl",
                    "currencyCode": "EUR",
                    "Currency": "Rupie",
                    "Symbol": "€"
                },
                {
                    "country": "New Caledonia",
                    "code": "NC",
                    "language": "French",
                    "default": "French",
                    "languageCode": "nc",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XPF",
                    "Currency": "Euro",
                    "Symbol": "CFP"
                },
                {
                    "country": "New Zealand",
                    "code": "NZ",
                    "language": "English",
                    "default": "English",
                    "languageCode": "nz",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NZD",
                    "Currency": "Franc",
                    "Symbol": "NZ$"
                },
                {
                    "country": "Nicaragua",
                    "code": "NI",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "ni",
                    "defaultLanguageCode": "es",
                    "currencyCode": "NIO",
                    "Currency": "Dollar",
                    "Symbol": "C$"
                },
                {
                    "country": "Niger",
                    "code": "NE",
                    "language": "French",
                    "default": "French",
                    "languageCode": "ne",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "CÃ³rdoba Oro",
                    "Symbol": "franc"
                },
                {
                    "country": "Nigeria",
                    "code": "NG",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ng",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NGN",
                    "Currency": "Franc",
                    "Symbol": "₦"
                },
                {
                    "country": "Niue",
                    "code": "NU",
                    "language": "English",
                    "default": "English",
                    "languageCode": "nu",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NZD",
                    "Currency": "Naira",
                    "Symbol": "NZ$"
                },
                {
                    "country": "Norfolk Island",
                    "code": "NF",
                    "language": "English",
                    "default": "English",
                    "languageCode": "nf",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "AUD",
                    "Currency": "Dollar",
                    "Symbol": "AU$"
                },
                {
                    "country": "Northern Mariana Islands",
                    "code": "MP",
                    "language": "English",
                    "default": "English",
                    "languageCode": "mp",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dollar",
                    "Symbol": "US$"
                },
                {
                    "country": "Norway",
                    "code": "NO",
                    "language": "Norwegian",
                    "default": "English",
                    "languageCode": "no",
                    "defaultLanguageCode": "no",
                    "currencyCode": "NOK",
                    "Currency": "Dollar",
                    "Symbol": "øre"
                },
                {
                    "country": "Oman",
                    "code": "OM",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "om",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "OMR",
                    "Currency": "Krone",
                    "Symbol": "ر.ع"
                },
                {
                    "country": "Pakistan",
                    "code": "PK",
                    "language": "Urdu",
                    "default": "English",
                    "languageCode": "pk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "PKR",
                    "Currency": "Rial",
                    "Symbol": "PKRs"
                },
                {
                    "country": "Palestine",
                    "code": "PS",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "ps",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "ILS",
                    "Currency": "Rupie",
                    "Symbol": "JD"
                },
                {
                    "country": "Panama",
                    "code": "PA",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "pa",
                    "defaultLanguageCode": "es",
                    "currencyCode": "PAB",
                    "Currency": "Schekel",
                    "Symbol": "PAB"
                },
                {
                    "country": "Papua New Guinea",
                    "code": "PG",
                    "language": "English",
                    "default": "English",
                    "languageCode": "pg",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "PGK",
                    "Currency": "Balboa",
                    "Symbol": "K"
                },
                {
                    "country": "Paraguay",
                    "code": "PY",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "py",
                    "defaultLanguageCode": "es",
                    "currencyCode": "PYG",
                    "Currency": "Kina",
                    "Symbol": "₲"
                },
                {
                    "country": "Peru",
                    "code": "PE",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "pe",
                    "defaultLanguageCode": "es",
                    "currencyCode": "PEN",
                    "Currency": "GuaranÃ­",
                    "Symbol": "S./"
                },
                {
                    "country": "Philippines",
                    "code": "PH",
                    "language": "Filipino",
                    "default": "English",
                    "languageCode": "ph",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "PHP",
                    "Currency": "Nuevo Sol",
                    "Symbol": "₱"
                },
                {
                    "country": "Pitcairn",
                    "code": "PN",
                    "language": "English",
                    "default": "English",
                    "languageCode": "pn",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GBP",
                    "Currency": "Peso",
                    "Symbol": "NZ$"
                },
                {
                    "country": "Poland",
                    "code": "PL",
                    "language": "Polish",
                    "default": "English",
                    "languageCode": "pl",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "PLN",
                    "Currency": "Pfund",
                    "Symbol": "zł"
                },
                {
                    "country": "Portugal",
                    "code": "PT",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "pt",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "EUR",
                    "Currency": "Zloty",
                    "Symbol": "€"
                },
                {
                    "country": "Puerto Rico",
                    "code": "PR",
                    "language": "Spanish",
                    "default": "English",
                    "languageCode": "pr",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Euro",
                    "Symbol": "US$"
                },
                {
                    "country": "Qatar",
                    "code": "QA",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "qa",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "QAR",
                    "Currency": "Dollar",
                    "Symbol": "ر.ق"
                },
                {
                    "country": "Réunion",
                    "code": "RE",
                    "language": "French",
                    "default": "French",
                    "languageCode": "re",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Dollar",
                    "Symbol": "€"
                },
                {
                    "country": "Romania",
                    "code": "RO",
                    "language": "Romanian",
                    "default": "English",
                    "languageCode": "ro",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "RON",
                    "Currency": "Euro",
                    "Symbol": "ROL"
                },
                {
                    "country": "Russia",
                    "code": "RU",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "ru",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "RUB",
                    "Currency": "Leu",
                    "Symbol": "RUруб"
                },
                {
                    "country": "Rwanda",
                    "code": "RW",
                    "language": "English",
                    "default": "English",
                    "languageCode": "rw",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "RWF",
                    "Currency": "Rubel",
                    "Symbol": "RF"
                },
                {
                    "country": "Saint Kitts and Nevis",
                    "code": "KN",
                    "language": "English",
                    "default": "English",
                    "languageCode": "kn",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Euro",
                    "Symbol": "EC$"
                },
                {
                    "country": "Saint Lucia",
                    "code": "LC",
                    "language": "English",
                    "default": "English",
                    "languageCode": "lc",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Dollar",
                    "Symbol": "EC$"
                },
                {
                    "country": "Saint Pierre and Miquelon",
                    "code": "PM",
                    "language": "French",
                    "default": "French",
                    "languageCode": "pm",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "EUR",
                    "Currency": "Gulden",
                    "Symbol": "€"
                },
                {
                    "country": "Saint Vincent and Grenadines",
                    "code": "VC",
                    "language": "English",
                    "default": "English",
                    "languageCode": "vc",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "XCD",
                    "Currency": "Euro",
                    "Symbol": "EC$"
                },
                {
                    "country": "Samoa",
                    "code": "WS",
                    "language": "English",
                    "default": "English",
                    "languageCode": "ws",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "WST",
                    "Currency": "Dollar",
                    "Symbol": "WS$"
                },
                {
                    "country": "Saudi Arabia",
                    "code": "SA",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "sa",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "SAR",
                    "Currency": "Tala",
                    "Symbol": "ر.س"
                },
                {
                    "country": "Senegal",
                    "code": "SN",
                    "language": "French",
                    "default": "French",
                    "languageCode": "sn",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Riyal",
                    "Symbol": "franc"
                },
                {
                    "country": "Serbia",
                    "code": "RS",
                    "language": "Serbian",
                    "default": "English",
                    "languageCode": "rs",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "RSD",
                    "Currency": "Franc",
                    "Symbol": "дин"
                },
                {
                    "country": "Seychelles",
                    "code": "SC",
                    "language": "French",
                    "default": "English",
                    "languageCode": "sc",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SCR",
                    "Currency": "Dinar",
                    "Symbol": "SRe"
                },
                {
                    "country": "Sierra Leone",
                    "code": "SL",
                    "language": "English",
                    "default": "English",
                    "languageCode": "sl",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SLL",
                    "Currency": "Rupie",
                    "Symbol": "Le"
                },
                {
                    "country": "Singapore",
                    "code": "SG",
                    "language": "Chinese",
                    "default": "English",
                    "languageCode": "sg",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SGD",
                    "Currency": "Leone",
                    "Symbol": "S$"
                },
                {
                    "country": "Slovakia",
                    "code": "SK",
                    "language": "Slovak",
                    "default": "English",
                    "languageCode": "sk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Dollar",
                    "Symbol": "Sk"
                },
                {
                    "country": "Slovenia",
                    "code": "SI",
                    "language": "Slovene",
                    "default": "English",
                    "languageCode": "si",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "EUR",
                    "Currency": "Euro",
                    "Symbol": "€"
                },
                {
                    "country": "Solomon Islands",
                    "code": "SB",
                    "language": "English",
                    "default": "English",
                    "languageCode": "sb",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SBD",
                    "Currency": "Euro",
                    "Symbol": "SI$"
                },
                {
                    "country": "Somalia",
                    "code": "SO",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "so",
                    "defaultLanguageCode": "sa",
                        "currencyCode": "SOS",
                    "Currency": "Dollar",
                    "Symbol": "Sh"
                },
                {
                    "country": "South Africa",
                    "code": "ZA",
                    "language": "Afrikaans",
                    "default": "English",
                    "languageCode": "za",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ZAR",
                    "Currency": "Schilling",
                    "Symbol": "SAR"
                },
                {
                    "country": "South Georgia/South Sandwich Islands",
                    "code": "GS",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gs",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GBP",
                    "Currency": "Rand",
                    "Symbol": "UK£"
                },
                {
                    "country": "Spain",
                    "code": "ES",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "es",
                    "defaultLanguageCode": "es",
                    "currencyCode": "EUR",
                    "Currency": "Pfund",
                    "Symbol": "€"
                },
                {
                    "country": "Sri Lanka",
                    "code": "LK",
                    "language": "Sinhala",
                    "default": "English",
                    "languageCode": "lk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "LKR",
                    "Currency": "Euro",
                    "Symbol": "LK₨"
                },
                {
                    "country": "Sudan",
                    "code": "SD",
                    "language": "Arabic",
                    "default": "English",
                    "languageCode": "sd",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SDG",
                    "Currency": "Rupie",
                    "Symbol": "£Sd"
                },
                {
                    "country": "Suriname",
                    "code": "SR",
                    "language": "Dutch",
                    "default": "Dutch",
                    "languageCode": "sr",
                    "defaultLanguageCode": "nl",
                    "currencyCode": "SRD",
                    "Currency": "Pfund",
                    "Symbol": "SR$"
                },
                {
                    "country": "Swaziland",
                    "code": "SZ",
                    "language": "English",
                    "default": "English",
                    "languageCode": "sz",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "SZL",
                    "Currency": "Dollar",
                    "Symbol": "SZL"
                },
                {
                    "country": "Sweden",
                    "code": "SE",
                    "language": "Swedish",
                    "default": "English",
                    "languageCode": "se",
                    "defaultLanguageCode": "se",
                    "currencyCode": "SEK",
                    "Currency": "Lilangeni",
                    "Symbol": "kr"
                },
                {
                    "country": "Switzerland",
                    "code": "cn",
                    "language": "French",
                    "default": "German",
                    "languageCode": "cn",
                    "defaultLanguageCode": "de",
                    "currencyCode": "CHF",
                    "Currency": "Krone",
                    "Symbol": "CHF"
                },
                {
                    "country": "Syria",
                    "code": "SY",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "sy",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "SYP",
                    "Currency": "Franken",
                    "Symbol": "S£"
                },
                {
                    "country": "Taiwan",
                    "code": "TW",
                    "language": "Chinese",
                    "default": "Chinese",
                    "languageCode": "tw",
                    "defaultLanguageCode": "cn",
                    "currencyCode": "TWD",
                    "Currency": "Pfund",
                    "Symbol": "NT$"
                },
                {
                    "country": "Tajikistan",
                    "code": "TJ",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "tj",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "TJS",
                    "Currency": "Dollar",
                    "Symbol": "TJS"
                },
                {
                    "country": "Tanzania",
                    "code": "TZ",
                    "language": "Swahili",
                    "default": "English",
                    "languageCode": "tz",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "TZS",
                    "Currency": "Somoni",
                    "Symbol": "TSh"
                },
                {
                    "country": "Thailand",
                    "code": "TH",
                    "language": "Thai",
                    "default": "English",
                    "languageCode": "th",
                    "defaultLanguageCode": "th",
                    "currencyCode": "THB",
                    "Currency": "Schilling",
                    "Symbol": "฿"
                },
                {
                    "country": "Timor-Leste",
                    "code": "TL",
                    "language": "Portuguese",
                    "default": "Portuguese",
                    "languageCode": "tl",
                    "defaultLanguageCode": "pt",
                    "currencyCode": "USD",
                    "Currency": "Baht",
                    "Symbol": "US$"
                },
                {
                    "country": "Togo",
                    "code": "TG",
                    "language": "French",
                    "default": "French",
                    "languageCode": "tg",
                    "defaultLanguageCode": "fr",
                    "currencyCode": "XOF",
                    "Currency": "Dollar",
                    "Symbol": "franc"
                },
                {
                    "country": "Tokelau",
                    "code": "TK",
                    "language": "English",
                    "default": "English",
                    "languageCode": "tk",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "NZD",
                    "Currency": "Franc",
                    "Symbol": "NZ$"
                },
                {
                    "country": "Tonga",
                    "code": "TO",
                    "language": "English",
                    "default": "English",
                    "languageCode": "to",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "TOP",
                    "Currency": "Dollar",
                    "Symbol": "PT$"
                },
                {
                    "country": "Trinidad and Tobago",
                    "code": "TT",
                    "language": "English",
                    "default": "English",
                    "languageCode": "tt",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "TTD",
                    "Currency": "Pa'anga",
                    "Symbol": "TT$"
                },
                {
                    "country": "Tunisia",
                    "code": "TN",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "tn",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "TND",
                    "Currency": "Dollar",
                    "Symbol": "د.ت"
                },
                {
                    "country": "Turkey",
                    "code": "TR",
                    "language": "Turkish",
                    "default": "English",
                    "languageCode": "tr",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "TRY",
                    "Currency": "Dinar",
                    "Symbol": "YTL"
                },
                {
                    "country": "Turkmenistan",
                    "code": "TM",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "tm",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "TMT",
                    "Currency": "Lira",
                    "Symbol": "m"
                },
                {
                    "country": "Uganda",
                    "code": "UG",
                    "language": "Swahili",
                    "default": "English",
                    "languageCode": "ug",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "UGX",
                    "Currency": "Manat",
                    "Symbol": "USh"
                },
                {
                    "country": "Ukraine",
                    "code": "UA",
                    "language": "Ukrainian",
                    "default": "Russian",
                    "languageCode": "ua",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "UAH",
                    "Currency": "Schilling",
                    "Symbol": "₴"
                },
                {
                    "country": "United Arab Emirates",
                    "code": "AE",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "ae",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "AED",
                    "Currency": "Hrywnja",
                    "Symbol": "د.إ"
                },
                {
                    "country": "United Kingdom",
                    "code": "GB",
                    "language": "English",
                    "default": "English",
                    "languageCode": "gb",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "GBP",
                    "Currency": "Dirham",
                    "Symbol": "UK£"
                },
                {
                    "country": "United States",
                    "code": "US",
                    "language": "English",
                    "default": "English",
                    "languageCode": "us",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Pfund",
                    "Symbol": "US$"
                },
                {
                    "country": "Uruguay",
                    "code": "UY",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "uy",
                    "defaultLanguageCode": "es",
                    "currencyCode": "UYU",
                    "Currency": "Dollar",
                    "Symbol": "UR$"
                },
                {
                    "country": "Uzbekistan",
                    "code": "UZ",
                    "language": "Russian",
                    "default": "Russian",
                    "languageCode": "uz",
                    "defaultLanguageCode": "ru",
                    "currencyCode": "UZS",
                    "Currency": "Peso",
                    "Symbol": "UZS"
                },
                {
                    "country": "Vanuatu",
                    "code": "VU",
                    "language": "English",
                    "default": "English",
                    "languageCode": "vu",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "VUV",
                    "Currency": "So'm",
                    "Symbol": "Vt"
                },
                {
                    "country": "Venezuela",
                    "code": "VE",
                    "language": "Spanish",
                    "default": "Spanish",
                    "languageCode": "ve",
                    "defaultLanguageCode": "es",
                    "currencyCode": "VEF",
                    "Currency": "Vatu",
                    "Symbol": "Bs"
                },
                {
                    "country": "Vietnam",
                    "code": "VN",
                    "language": "Vietnamese",
                    "default": "English",
                    "languageCode": "vn",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "VND",
                    "Currency": "BolÃ­var Fuerte",
                    "Symbol": "₫"
                },
                {
                    "country": "Virgin Islands",
                    "code": "VI",
                    "language": "English",
                    "default": "English",
                    "languageCode": "vi",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "USD",
                    "Currency": "Dong",
                    "Symbol": "US$"
                },
                {
                    "country": "Yemen",
                    "code": "YE",
                    "language": "Arabic",
                    "default": "Arabic",
                    "languageCode": "ye",
                    "defaultLanguageCode": "sa",
                    "currencyCode": "YER",
                    "Currency": "Dollar",
                    "Symbol": "YER"
                },
                {
                    "country": "Zambia",
                    "code": "ZM",
                    "language": "English",
                    "default": "English",
                    "languageCode": "zm",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ZMK",
                    "Currency": "Rial",
                    "Symbol": "ZK"
                },
                {
                    "country": "Zimbabwe",
                    "code": "ZW",
                    "language": "English",
                    "default": "English",
                    "languageCode": "zw",
                    "defaultLanguageCode": "gb",
                    "currencyCode": "ZWL",
                    "Currency": "Kwacha",
                    "Symbol": "Z$"
                }
            ];

            return {
                get: function (country) {
                    console.log(country);
                    var current = countryList.filter(function (obj) {
                        return obj.countryList == country;
                    });
                    return current;
                },
                getCountryByName: function (c) {
                    var current = countryList.filter(function (obj) {
                        return obj.country == c;
                    });
                    return current[0];

                },
                getLanguageFromCountryName: function (country) {
                    var current = countryList.filter(function (obj) {
                        return obj.country == country;
                    });
                    if (!current.length) {
                        return 'gb';
                    } else {
                        var lngDef = $rootScope.languages.filter(function (obj) {
                            return obj.shortname == current[0].defaultLanguageCode;
                        });
                        if (lngDef.length) {
                            return current[0].defaultLanguageCode;
                        } else {
                            return "gb";
                        }
                    }
                },
                getCurrencyByCountryName: function (country) {
                    var current = countryList.filter(function (obj) {
                        return obj.country == country;
                    });
                    console.log(' CCCC : ', country, current);
                    if (current.length) {
                        return current[0].currencyCode
                    } else {
                        return "THB";
                    }
                },
                getLanguageFromCountry: function (lng) {
                    console.log(lng);
                    if (lng == 'uk') {
                        return "USD"
                    } else {
                        var current = countryList.filter(function (obj) {
                            return obj.languageCode == lng;
                        });
                        var lngDef = $rootScope.currencies.filter(function (obj) {
                            return obj.currency == current[0].currencyCode;
                        });
                        if (lngDef.length) {
                            return current[0].currencyCode;
                        } else {
                            return "USD";
                        }
                    }
                    return current;
                },
                getCountries: function () {
                    var list = [];
                    for (var i = 0; i < countryList.length; i++) {
                        list.push(countryList[i].country);
                    }
                    return list;
                }
            };
        }]);
})();

(function () {
    "use strict";
    angular.module('ThaiHome')
        .run(['$rootScope', '$state', '$stateParams',
            function ($rootScope, $state, $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
        ])
        .controller('Locale', ['$scope', 'CONFIG', '$rootScope', '$http', 'CountryToLanguage',
            function ($scope, CONFIG, $rootScope, $http, CountryToLanguage) {


                if(!localStorage.getItem('checkin')){
                    //console.log("get-checkin");
                    localStorage.setItem('checkin',moment().add(30, 'days').format(CONFIG.DEFAULT_DATE_FORMAT));
                    localStorage.setItem('checkout',moment().add(37, 'days').format(CONFIG.DEFAULT_DATE_FORMAT));
                    localStorage.setItem('dateexpire',moment().utc().add(1, 'days').unix());
                }

                $scope.getCurrencyByCountry = function (lng) {
                    if(lng == 'gb'){
                        $scope.updateCurrency("USD");
                    }else{
                        var currency = CountryToLanguage.getLanguageFromCountry(lng);
                        $scope.updateCurrency(currency);
                    }
                };
                $scope.updateLanguage = function (language) {
                    localStorage.setItem('locale', language);
                    location.reload();
                    $http.get(CONFIG.API_URL + '/translations/' + language + '.json')
                        .success(function (data) {
                            $rootScope.T = data;
                            $rootScope.language = language;
                        });

                };

                $scope.updateCurrency = function (currency) {
                    localStorage.setItem('currency', currency);
                    $http.get(CONFIG.API_URL + '/findcol', {
                        params: {
                            collection: 'currency',
                            property: 'currency',
                            value: localStorage.getItem('currency')
                        }
                    }).success(function (data) {
                        if (currency === CONFIG.DEFAULT_CURRENCY) {
                            $rootScope.currencyRate = 1;
                        } else {
                            $rootScope.currencyRate = $rootScope.currencyRates[currency];
                        }

                        $rootScope.currency = data.symbol;
                        $rootScope.currencyname = data.name;
                    });
                };
            }])
        .service('Locale', ['$http', '$q', '$rootScope', 'CONFIG','CountryToLanguage','Language', function ($http, $q, $rootScope, CONFIG, CountryToLanguage, Language) {
            this.init = function () {
                $http.get(CONFIG.API_URL + '/getip').success(function (response) {
                    if(response.country != null && response.country != 'Thailand'){

                        var lng = CountryToLanguage.getLanguageFromCountryName(response.country);

                        var currency = CountryToLanguage.getCurrencyByCountryName(response.country);

                        if (localStorage.getItem('locale') == null) {
                            localStorage.setItem('locale', lng);
                        }
                        if (localStorage.getItem('currency') == null) {
                            localStorage.setItem('currency', currency);
                        }
                        setLanguage();
                        getAllCurrencies(setCurrency);
                    }else if(response.country == 'Thailand'){
                        var lng =  window.navigator.userLanguage || window.navigator.language;

                        if(lng.length != 2){
                           lng = lng.slice(0,-3)
                        }
                        var filteredLng = $rootScope.languages.filter(function(obj){
                            return obj.shortname == lng || obj.browserLanguage == lng;
                        });
                        if(filteredLng.length == 0){
                            lng = "gb"
                        }else{
                            lng = filteredLng[0].shortname;
                        }
                        var currency = CountryToLanguage.getCurrencyByCountryName(response.country);
                        if (localStorage.getItem('locale') == null) {
                            localStorage.setItem('locale', lng);
                        }
                        if (localStorage.getItem('currency') == null) {
                            localStorage.setItem('currency', currency);
                        }
                        setLanguage();
                        getAllCurrencies(setCurrency);
                    }
                    else{
                        var lng = 'gb';

                        var currency = 'THB';

                        if (localStorage.getItem('locale') == null) {
                            localStorage.setItem('locale', lng);
                        }
                        if (localStorage.getItem('currency') == null) {
                            localStorage.setItem('currency', currency);
                        }
                        setLanguage();
                        getAllCurrencies(setCurrency);
                    }
                    function getAllCurrencies(callback) {
                        $http.get(CONFIG.API_URL + '/locale')
                            .success(function (response) {
                                $rootScope.languages = response.languages;
                                $rootScope.currencies = response.currencies;
                                $http.get(CONFIG.API_URL + '/currencydata').success(function (data) {
                                    var response = JSON.parse(data[0].data);
                                    $rootScope.currencyRates = response.rates;
                                    $rootScope.currencyRates[CONFIG.DEFAULT_CURRENCY] = 1;
                                    var currentCurrency = _.findWhere($rootScope.currencies, {
                                        currency: localStorage.getItem('currency')
                                    });
                                    $rootScope.currencyname = currentCurrency.name;
                                    $rootScope.currency = currentCurrency.symbol;
                                    $rootScope.currencyRate = $rootScope.currencyRates[currentCurrency.currency];
                                    callback()
                                });
                            });
                    }
                    function setLanguage() {
                        $http.get('/translations/' + localStorage.getItem('locale') + '.json')
                            .success(function (response) {
                                $rootScope.TD = response;
                                $rootScope.T = response;
                                $http.get(CONFIG.API_URL + '/findcol', {
                                    params: {
                                        collection: 'language',
                                        property: 'shortname',
                                        value: localStorage.getItem('locale')
                                    }
                                })
                                    .success(function (response) {
                                        $rootScope.language = response.shortname;
                                    });
                            });
                    }

                    function setCurrency() {
                        var currency = localStorage.getItem('currency');
                        $http.get(CONFIG.API_URL + '/findcol', {
                            params: {
                                collection: 'currency',
                                property: 'currency',
                                value: localStorage.getItem('currency')
                            }
                        }).success(function (data) {
                            if (currency === CONFIG.DEFAULT_CURRENCY) {
                                $rootScope.currencyRate = 1;
                            } else {
                                $rootScope.currencyRate = $rootScope.currencyRates[currency];
                            }

                            $rootScope.currency = data.symbol;
                            $rootScope.currencyname = data.name;
                        });
                    };

                });
            };

            this.period = function (nights) {
                var weeks, days;
                if (nights > 6) {
                    weeks = nights / 7;
                    days = nights - Math.floor(weeks) * 7;
                    weeks = Math.floor(weeks);
                } else {
                    weeks = false;
                    days = nights;
                }

                if (weeks) {
                    return weeks + ' weeks, ' + Math.ceil(days) + ' nights';
                }
                return Math.ceil(days) + ' nights';

            };

            this.setAgent = function (id) {
                localStorage.setItem('agent', JSON.stringify({
                    agent: id,
                    expires: moment().add(7, 'days').unix()
                }));
            };

            this.getAgent = function () {
                var data = localStorage.getItem('agent');
                data = JSON.parse(data);

                if (_.isObject(data)) {
                    if (moment().unix() > data.expires) {
                        return false;
                    } else {
                        return data.agent;
                    }
                } else {
                    return false;
                }
            };

            this.setDates = function (checkin, checkout) {
                localStorage.setItem('checkin', checkin);
                localStorage.setItem('checkout', checkout);
                localStorage.setItem('dateexpire', moment().add(1, 'hour').unix());
            };

            this.setDefaultDates = function (agent) {

                var checkin = moment().format(CONFIG.DEFAULT_DATE_FORMAT);
                var day = 1;
                if (agent) day = 7;
                var checkout = moment().add(day, 'day').format(CONFIG.DEFAULT_DATE_FORMAT);

                this.setDates(checkin, checkout);

                return {
                    "checkin": checkin,
                    "checkout": checkout
                };
            };

            this.getDates = function (force, agent) {
                var checkin = localStorage.getItem('checkin');
                var checkout = localStorage.getItem('checkout');
                var expires = localStorage.getItem('dateexpire');
                console.log('chck-flag1');

                if(!checkin || !checkout){
                    localStorage.setItem('checkin',moment().add(30, 'days').format(CONFIG.DEFAULT_DATE_FORMAT));
                    localStorage.setItem('checkout',moment().add(37, 'days').format(CONFIG.DEFAULT_DATE_FORMAT));
                    localStorage.setItem('dateexpire',moment().utc().add(1, 'days').unix());

                    checkin = moment().add(30, 'days').format(CONFIG.DEFAULT_DATE_FORMAT);
                    checkout = moment().add(37, 'days').format(CONFIG.DEFAULT_DATE_FORMAT);
                    expires = moment().utc().add(1, 'days').unix();
                }

                var valid = true;

                if (expires && (parseInt(moment().unix()) - parseInt(expires) > 0)) {
                    valid = false;
                }


                if (this.validateDates(checkin, checkout) === false) {
                    valid = false;
                    if (force === true) {
                        var newDates = this.setDefaultDates(agent);
                        checkin = newDates.checkin;
                        checkout = newDates.checkout;
                        valid = true;
                    }
                }

                return {
                    "checkin": checkin,
                    "checkout": checkout,
                    "valid": valid
                };
            };

            this.deleteDates = function () {
                localStorage.removeItem('checkin');
                localStorage.removeItem('checkout');
            };

            this.validateDates = function (checkin, checkout) {
                var valid = true;

                var now = moment(new Date(), CONFIG.DEFAULT_DATE_FORMAT);

                if (!moment(checkin, CONFIG.DEFAULT_DATE_FORMAT, true).isValid() || !moment(checkout, CONFIG.DEFAULT_DATE_FORMAT, true).isValid()) {
                    valid = false;
                }
                if (moment(checkin, CONFIG.DEFAULT_DATE_FORMAT).diff(now, 'days') < 0 || moment(checkout, CONFIG.DEFAULT_DATE_FORMAT).diff(now, 'days') < 1) {
                    valid = false;
                }

                return valid;
            };

        }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('Location', ['$http', 'CONFIG', '$q', function ($http, CONFIG, $q) {
      return {
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/location', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/location', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/location/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/location/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/location/' + id).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        }
      };
    }]);
})();
(function () {
  "use strict";
  angular.module('ThaiHome')
    .service("Modal", ['$uibModal', '$rootScope', '$templateCache', 'CONFIG', 'Property', 'DTOptionsBuilder', 'User', 'Discount', 'Location', 'Email', 'Notification', 'Currency', '$filter', 'Season', '$sce','$route', function ($uibModal, $rootScope, $templateCache, CONFIG, Property, DTOptionsBuilder, User, Discount, Location, Email, Notification, Currency, $filter, Season, $sce , $route) {
      this.openGallery = function (images, unique) {
        var template = $templateCache.get('templates/thaihome/property-gallery/index.html');
        var scope = $rootScope.$new();
        scope.images = images;
        scope.unique = unique;
        $uibModal.open({
          windowClass: 'property-gallery',
          template: template,
          scope: scope,
          controller: "GalleryCtrl",
          animation: true
        });
      };

      this.propertyDetails = function (property, translation, close) {
        var template = $templateCache.get('templates/thaihome/property-details/more.html');
        var scope = $rootScope.$new();
        scope.showMoreClose = close;
        scope.property = property;
        scope.translation = translation;
        $uibModal.open({
          windowClass: 'about-property',
          template: template,
          scope: scope,
          animation: true
        });
      };

      this.default = function (message) {

        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><p>' + message + '</p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: true
        });
      };

      this.rules = function (translation) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        console.log(translation);
        $uibModal.open({
          template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><h3>House Rules</h3><p class="wrapspace">' + translation.texts[0].house_rules + '</p>',
          windowTemplate: windowTemplate,
          scope: false,
          windowClass: 'property-rules',
          animation: true
        });
      };


      this.messageReceived = function () {
        return false;
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><p>Your message has been sent. We will reply as quickly as possible.</p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: true
        });
      };

      this.tags = function (data) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/tags/index.html');
        $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          animation: true
        });

      };

      this.cancellation = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><h3>{{T.transCancellation}}</h3><p ng-bind-html="T.transCancellationTerms"></p>',
          windowTemplate: windowTemplate,
          scope: false,
          windowClass: 'property-rules',
          animation: true
        });
      };
      /*
       1) Cleaning fees are always refunded if the guest did not check in.
       2) Cancellation must be by email to note@flipinvert.com
       3) For a full refund, cancellation must be made 5 days before the check in, if later than 5 days, any booking fee or deposit will be kept by the
       */

      this.bookingList = function (data) {
        var scope = $rootScope.$new(true);
        scope.bookings = data;
        scope.dtOptions = DTOptionsBuilder.newOptions();
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/booking/index.html');
        $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          scope: scope,
          animation: true
        });

      };

      this.newBooking = function (email, id) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Your booking has been saved</h3><p>A booking confirmation will be sent to ' + email + ' as  soon as we receive the payment. <br />Please note, a bank transfer can take 4-6 days, we will notify you as soon as we get the money</p><p><a ng-click="$close()" href="javascript:void(0);" ui-sref="booking({id: \'' + id + '\' })"><md-button class="md-raised md-primary">View Booking Status</md-button></a> <md-button class="md-raised md-primary" ng-click="$close()">Continue with Payment</md-button></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      function getIdAsString(id){
        return String(id);
      };

      this.newBookingManagement = function (id) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Booking has been saved</h3><p><a ng-click="$close()" href="/management/booking/' + id + '//"><md-button class="md-raised md-primary">View Booking Status</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.bookingUpdateModal = function (id) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<div style="text-align:center;"><h3>Booking has been saved</h3><p><a ng-click="$close()" ui-sref="management.home" ui-sref-opts="{reload: true, notify: true}"><md-button class="md-raised md-primary">Home</md-button></a><a ng-click="$close()" href="/management/booking/' + id + '// "><md-button class="md-raised md-primary">Ok</md-button></a></p></div>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        })
      };

      this.minimDays = function (days) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Sorry</h3><p>This property requires a minimum booking period of <b>' + days + '</b> nights</p><p><a ng-click="$close()" href="javascript:void(0);"><md-button class="md-raised md-primary">OK</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.doubleBooking = function (data) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $('.page-loading').addClass('hide');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Dates not available</h3><p>We\'re sorry but it appears these dates (<b>' + moment.unix(data.checkin).utc().format(CONFIG.DEFAULT_DATE_FORMAT) + ' - ' + moment.unix(data.checkout).utc().format(CONFIG.DEFAULT_DATE_FORMAT) + '</b>) are allready booked</p><p>Please go back and select other dates<p><a ng-click="openCalendar();$close();" href="javascript:void(0);"><md-button class="md-raised md-primary">Back</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.doubleBookingAgent = function (data) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
		$('.page-loading').addClass('hide');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Dates not available</h3><p>We\'re sorry but it appears these dates (<b>' + moment.unix(data.checkin).format(CONFIG.DEFAULT_DATE_FORMAT) + ' - ' + moment.unix(data.checkout).format(CONFIG.DEFAULT_DATE_FORMAT) + '</b>) are allready booked</p><p>Please go back and select other dates<p><a ui-sref="agent.home" ng-click="$close();" href="javascript:void(0);"><md-button class="md-raised md-primary">Back</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.newBookingAgent = function (email, id) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Your booking has been saved</h3><p>A booking confirmation will be sent to ' + email + ' as  soon as we receive the payment. <br />Please note, a bank transfer can take 4-6 days, we will notify you as soon as we get the money</p><p><a ng-click="$close()" href="javascript:void(0);" ui-sref="agent.booking({id: \'' + id + '\' })"><md-button class="md-raised md-primary">View Booking Status</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.newAgent = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Successfully Registered</h3><br><p><a ng-click="$close()" href="javascript:void(0);" ui-sref="agent_login"><md-button class="md-raised md-primary">Login</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.ownership = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><p><b>Tenant Ownership</b><p>If you are the agent who first booked this tenant, then you are the tenant owner. This means that any future bookings this tenant makes with us will pay commission to you for the next 2 years. Even if the tenant books directly with us or extends his lease with us, you will still be paid <b><u>full commission!</u></b></p><br /><p><b>Send booking to Tenant</b></p><p>You can send the booking link to the tenant. This will show information and photos to the tenant with your agency name on the booking form. It will also allow the tenant to pay the booking via credit cards, paypal or bank transfer directly into our account via our online secure payment system. We will inform you once the tenant has paid and transfer your commission. </p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false,
        });
      };

      this.rating = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<p>Your rating has been saved</p><p>Thank you!</p><p><a ui-sref="home" ui-sref-opts="{reload:true}" ng-click="$close()" style="cursor:pointer;"><button class="btn btn-primary">Back to Thaihome</button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: true
        });
      };

      this.throwError = function (error) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<h3>ERROR:</h3><br /><p>' + error + '</p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: true
        });
      };

      this.agentList = function (showExtra, commission) {
        var modal = this;
        User.getAll({
          type: "agent"
        }).then(function (agents) {
          var scope = $rootScope.$new(true);
          scope.agents = agents;
          scope.commission = commission;
          scope.conditionsAgent = '';
          scope.dtOptions = DTOptionsBuilder.newOptions();
          scope.selectAgent = function (agent, commissionC, conditionsAgent) {
            $rootScope.$broadcast("agentSelected", agent, commissionC, conditionsAgent);
          };
          scope.showExtra = showExtra ? true : false;
          scope.addAgent = function () {
            modal.addAgent();
          };
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/agent/index.html');
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
        });

      };

      this.addTenant = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/tenant/add.html');
        var scope = $rootScope.$new(true);
        scope.createTenant = function (tenant) {
          instance.close();
          tenant.type = 'tenant';
          tenant.password = tenant.email;
          tenant.username = tenant.email;
          User.add(tenant).then(function (data) {
            $rootScope.$broadcast("tenantSelected", data.data);
          });
        };
        var instance = $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          scope: scope,
          animation: true
        });
      };

      this.addAgent = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/agent/add.html');
        var scope = $rootScope.$new(true);
        scope.createAgent = function (agent) {
          instance.close();
          agent.type = 'agent';
          agent.agent = agent.name;
          User.add(agent).then(function (data) {
            $rootScope.$broadcast("agentSelected", data.data);
          });
        };
        var instance = $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          scope: scope,
          animation: true
        });
      };

      this.tenantList = function () {
        var modal = this;
        User.getAll({
          type: "tenant"
        }).then(function (tenants) {
          var scope = $rootScope.$new(true);
          scope.tenants = tenants;
          scope.addTenant = function () {
            modal.addTenant();
          };
          scope.dtOptions = DTOptionsBuilder.newOptions();
          scope.selectTenant = function (tenant) {
            $rootScope.$broadcast("tenantSelected", tenant);
          };
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/tenant/index.html');
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
        });

      };


      this.seasonList = function () {
        var scope = $rootScope.$new(true);
        scope.seasons = Season.list();
        scope.dtOptions = DTOptionsBuilder.newOptions();
        scope.selectSeason = function (season) {
          $rootScope.$broadcast("seasonSelected", season);
        };
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/season/index.html');
        $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          scope: scope,
          animation: true
        });

      };

      this.currencyList = function () {
        Currency.getAll().then(function (currencies) {
          var scope = $rootScope.$new(true);
          scope.currencies = currencies;
          scope.dtOptions = DTOptionsBuilder.newOptions();
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/currency/index.html');
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true,
            controller: 'Locale'
          });
        });

      };

      this.statusList = function (statuses) {
        //statuses = _.without(statuses, _.findWhere(statuses, {
        //value: 1
        //}));
        var scope = $rootScope.$new(true);
        scope.statuses = statuses;
        scope.dtOptions = DTOptionsBuilder.newOptions();
        scope.selectStatus = function (status) {
          $rootScope.$broadcast("statusSelected", status);
        };
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/status/index.html');
        $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          scope: scope,
          animation: true,
          controller: 'Locale'
        });
      };

      /*this.emailList = function (booking, sentEmails, autoselect, user) {
		var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/email/index.html');
        var scope = $rootScope.$new(true);
        Email.list().then(function (emails) {
          scope.emails = _.sortBy(emails, function(e) { return e.name; }); // 2016-05-31 - Ajay - Emails sort by name
          scope.languages = $rootScope.languages;
          scope.emailLanguage = 'en';
          scope.searchEmail = function (value) {
            var found = _.findWhere(sentEmails, {
              "email": value
            });
            if (found) {
              return ' - Sent ' + $filter('timeAgo')(found.date);
            } else {
              return '';
            }
          };

          scope.getEmailHTML = function (type) {
            Email.send(type, {
              booking: booking,
              preview: true,
              subject: $rootScope.T['email_subject_' + type],
              language: scope.emailLanguage,
              userID:  $rootScope.admin.id
            }).then(function (data) {
              scope.emailHTML = $sce.trustAsHtml('<div style="overflow-y:auto;">' + data.html + '</div>');
              scope.subject = data.subject;
            });
          };

          scope.selectLang = function (l) {
            scope.emailLanguage = l;
          };

		  scope.tenantDetail = {};
		  scope.getTenantDetail = function(id){
			User.getDetails(id).then(function (data) {
				scope.tenantDetail = data;
			});
		  }

          var modalInstance = $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
          var origModalInstance = modalInstance;

          modalInstance.rendered.then(function () {
            if (autoselect) {
              scope.emailType = autoselect;
              scope.getEmailHTML(autoselect);
              scope.getTenantDetail(user);
            }else{
				scope.getTenantDetail(user);
			}
          });

          scope.sendEmail = function (type, preview, html,subject) {
            Email.send(type, {
              booking: booking,
              customHTML: html.toString(),
              preview: preview || false,
              //subject: $rootScope.T['email_subject_' + type],
              customSubject:subject,
              language: scope.emailLanguage,
			  userID:  $rootScope.admin.id
            }).then(function (data) {
              if (preview) {
                $uibModal.open({
                  template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><div style="overflow-y:auto;">' + data + '</div>',
                  animation: true
                });
                return;
              }
              $rootScope.$broadcast("emailSent", {
                booking: booking,
                type: type
              });
              origModalInstance.close();
              Notification.success({
                message: 'Email sent!'
              });
              if (type == 'rating') {
                $rootScope.$broadcast('updateStatus', {
                  id: booking,
                  status: 6
                });
              }
			  window.location.reload();  // 2016-05-31 - Ajay - Reload when send email
            }).catch(function (e) {
              Notification.error({
                message: e
              });
            });
          };
        });


      };*/


      this.locationList = function () {
        Location.getAll().then(function (locations) {
          var scope = $rootScope.$new(true);
          scope.locations = locations;
          scope.dtOptions = DTOptionsBuilder.newOptions();
          scope.selectLocation = function (tenant) {
            $rootScope.$broadcast("locationSelected", tenant);
          };
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/location/index.html');
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
        });

      };

      this.propertyList = function (checkin, checkout) {
        Notification.success({
          message: 'Loading...'
        });
        Property.getAllDetails(checkin, checkout).then(function (properties) {
          var data = properties;
          var scope = $rootScope.$new(true);
          scope.data = data;
          scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bPaginate', false);
          scope.selectProperty = function (property) {
            $rootScope.$broadcast("propertySelected", property);
          };
          scope.currency = $rootScope.currency;
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/property/index.html');
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
        });

      };

      this.discountList = function () {
        Discount.findAll({
          active: true
        }).then(function (discounts) {
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/discount/index.html');
          var data = discounts;
          var scope = $rootScope.$new(true);
          scope.data = data;
          scope.dtOptions = DTOptionsBuilder.newOptions();
          scope.selectDiscount = function (discount) {
            $rootScope.$broadcast("discountSelected", discount);
          };
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
        });
      };

          }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .directive('navigation', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        template: function () {
          return $templateCache.get('templates/thaihome/navigation/index.html');
        }
      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('news', {
        url: '/news/',
        title: 'title_news',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/news/index.html');
        },
        controller: "NewsCtrl",
        resolve: {
          News: ["$q", "News", function ($q, News) {
            var d = $q.defer();
            News.getAll().then(function (data) {
              d.resolve(data);
            });
            return d.promise;
          }]
        }
      });
    }])
    .controller("NewsCtrl", ["$scope", "News", "$sce", function ($scope, News, $sce) {
      $scope.news = News;
      $scope.nrNews = 5;
      $scope.moreNews = function () {
        $scope.nrNews += $scope.nrNews;
      };
      $scope.deliberatelyTrustDangerousSnippet = function (text) {
        return $sce.trustAsHtml(text);
      };
    }])
    .factory('News', ['$http', 'CONFIG', '$q', 'dpd', function ($http, CONFIG, $q, dpd) {

      return {
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/news', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        getNews: function () {
          var defer = $q.defer();
          var timestamp = moment().format('X');
          var timeEnd = moment().add(60,'days').format('X');
          var query = {
            end: {
              $lte: timeEnd
            },
            start: {
              $gte: timestamp
            }
          };
          $http.get(CONFIG.API_URL + '/news', {
            params: query
          }).then(function (data) {
            defer.resolve(data.data);
          }).catch(function (err) {
            defer.resolve({
              data: []
            });
          });
          return defer.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/news', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/news/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/news/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/news/' + id).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        }
      };

    }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .controller('Newsletter', ['CONFIG', 'Modal', '$scope', '$http', function (CONFIG, Modal, $scope, $http) {
      $scope.add = function () {
        $http.post(CONFIG.API_URL + "/newsletter", {
            email: $scope.email,
            added: moment().unix()
          })
          .success(function (response) {
            if (response.message === 'duplicate') {
              Modal.default('Your email already exists in our newsletter list.');
              $scope.email = '';
            } else {
              Modal.default('Your email has been added to our newsletter list.');
              $scope.email = '';
            }

          });
      }
    }])
})();
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

(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('Period', ['$http', 'CONFIG', '$q', function ($http, CONFIG, $q) {
      return {
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/season', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/season', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/season/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/season/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/season/' + id).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        }
      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('Price', ['$http', 'CONFIG', '$q', function ($http, CONFIG, $q) {
      return {
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/price', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/price', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/price/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/price/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getPropDetailes: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/price?property=' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/price/' + id).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        }
      };
    }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .controller('GalleryCtrl', ['$scope', function ($scope) {
      $scope.width = 59;
      $scope.modalHeight = 555 + parseInt($scope.images.length / 12) * 110;
      // initial image index
      $scope._Index = 0;

      $scope.$watch('_Index', function () {
        $('#photogallery .nav').css('left', '-' + $scope._Index * $scope.width + 'px');
      });

      // if a current image is the same as requested image
      $scope.isActive = function (index) {
        return $scope._Index === index;
      };

      // show prev image
      $scope.showPrev = function () {
        $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.images.length - 1;
      };

      // show next image
      $scope.showNext = function () {
        $scope._Index = ($scope._Index < $scope.images.length - 1) ? ++$scope._Index : 0;

      };

      // show a certain image
      $scope.showPhoto = function (index) {
        $scope._Index = index;
      };

      $scope.initSpace = function () {
        $(document).bind('keydown', 'space', function (evt) {
          $(this).find('.nextimg').click();
          evt.preventDefault();
          return false;
        });
      };
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('property', {
        url: '/property/:id/:discount/:agent/:action/',
        params: {
          id: {
            value: null,
            squash: true
          },
          agent: {
            value: null,
            squash: true
          },
          discount: {
            value: null,
            squash: true
          },
          action: {
            value: null,
            squash: true
          }
        },
        title: 'title_property',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/property/index.html');
        },
        controller: 'PropertyCtrl',
        resolve: {
          currentUser: ['Auth', '$q', function (Auth, $q) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              d.resolve(data);
            }).catch(function () {
              d.resolve({});
            });

            return d.promise;
          }],
          Agent: ['$q', '$stateParams', 'User', 'Locale', function ($q, $stateParams, User, Locale) {
            var d = $q.defer();
            if ($stateParams.agent) {
              User.getDetails($stateParams.agent).then(function (data) {
                if (data.type === 'agent') {
                  d.resolve(data);
                  Locale.setAgent(data.id);
                } else {
                  d.resolve(false);
                }
              }).catch(function () {
                d.resolve(false);
              });

            } else if (Locale.getAgent()) {
              User.getDetails(Locale.getAgent()).then(function (data) {
                if (data.type === 'agent') {
                  d.resolve(data);
                } else {
                  d.resolve(false);
                }
              }).catch(function () {
                d.resolve(false);
              });
            } else {
              d.resolve(false);
            }

            return d.promise;
          }],
          PropertyData: ["Property", "$q", "$stateParams", function (Property, $q, $stateParams) {
            var deferred = $q.defer();
            Property.getDetails($stateParams.id).then(function (data) {
              deferred.resolve(data);
            }).catch(function (err) {
              deferred.reject(err, 404);
            });
            return deferred.promise;
          }],
          Ratings: ["Rating", "$q", "$stateParams", function (Rating, $q, $stateParams) {
            var d = $q.defer();
            Rating.getPropertyRatings($stateParams.id).then(function (data) {
              d.resolve(data);
            });
            return d.promise;
          }],
          Message: ['Contact', '$q', 'Auth', function (Contact, $q, Auth) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              return Contact.getMessage(null, data.data.id, null);
            }).then(function (data) {
              d.resolve(data);
            });

            return d.promise;
          }]
        }
      });
    }])
    .factory("Property", ["$http", "$q", "CONFIG", "Search", function ($http, $q, CONFIG, Search) {
      return {
        getDetails: function (id) {
          var d = $q.defer();
          if (!id) {
            d.reject();
          } else {
            $http.post(CONFIG.API_URL + '/property-details/', {
                "id": id,
                "language": localStorage.getItem('locale')
              })
              .then(function (response) {
                d.resolve(response);
              }, function (err) {
                d.reject(err);
              });
          }
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/property/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/property', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        getAll: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/property')
            .then(function (data) {
              d.resolve(data.data);
            }, function (err) {
              d.reject(err);
            });
          return d.promise;
        },
        getAllDetails: function (checkin, checkout) {
          if (!checkin || !checkout) {
            checkin = moment().format(CONFIG.DEFAULT_DATE_FORMAT);
            checkout = moment().add(7, 'days').format(CONFIG.DEFAULT_DATE_FORMAT);
          }
          var d = $q.defer();
          Search.getResults(0, checkin, checkout).then(function (data) {
            d.resolve(data.data);
          });
          return d.promise;
        }
      };

    }])
    .directive('propertyDetails', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        scope: false,
        template: function () {
          return $templateCache.get('templates/thaihome/property-details/index.html');
        }
      };
    }])
    .directive('propertyAbout', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        scope: false,
        template: function () {
          return $templateCache.get('templates/thaihome/property-details/about.html');
        }
      };
    }])
    .directive('propertyMoreinfo', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'AE',
        scope: false,
        template: function () {
          return $templateCache.get('templates/thaihome/property-details/more.html');
        }
      };
    }])
    .controller('PropertyCtrl', ['Modal', 'currentUser', 'Message', '$http', '$scope', '$filter', 'PropertyData', 'Ratings', 'Calendar', 'Contact', '$rootScope', 'CONFIG', 'gMaps', '$state', '$stateParams', 'Discount', 'Agent', '$timeout', function (Modal, currentUser, Message, $http, $scope, $filter, PropertyData, Ratings, Calendar, Contact, $rootScope, CONFIG, gMaps, $state, $stateParams, Discount, Agent, $timeout) {
      //Getprice 
      var start = new Date(); //start date
      var end = new Date();
      end.setDate(end.getDate() + 1); //end date
      var url = CONFIG.HELPER_URL + "/price/getPrice/";
      var objprice = [];

      //Set price in price detail (-Soon Make in fac-)
      objprice = {
        "priceWeekend": 2300,
        "priceWeek": 11500,
        "priceMonth": 23500,
        "priceYear": 270000,
        "commissionDay": 20,
        "commissionWeek": 20,
        "commissionMonth": 15,
        "commissionYear": 8.33,
        "created": 1485332191,
        "depositDay": 2000,
        "depositWeek": 5000,
        "depositMonth": 23500,
        "depositYear": 45000,
        "reservationDay": 2000,
        "reservationWeek": 2000,
        "reservationMonth": 5000,
        "reservationYear": 1000,
      }


      $scope.chatdisabled = false;
      $scope.propertyDetails = false;
      $scope.showPrices = false;
      Calendar.loadCalendar(false, false, false, PropertyData.data.bookings);
      $scope.property = PropertyData.data.property;
      $scope.translation = PropertyData.data.translation;
      $scope.high = PropertyData.data.high;
      $scope.price = objprice;
      //console.log($scope.price);
      $scope.discount = {};
      $scope.discount.percentage = 0;
      $scope.refAgent = Agent;

      if ($rootScope.agent) {
        $scope.rentlink = $state.href('property', {
          id: $scope.property.unique,
          agent: $rootScope.agent.id
        }, {
          absolute: true
        });
        $scope.salelink = $state.href('sale', {
          id: $scope.property.unique,
          agent: $rootScope.agent.id
        }, {
          absolute: true
        });
      }

      if (currentUser.data) {
        $scope.contact = {};
        $scope.contact.name = currentUser.data.name;
        $scope.contact.email = currentUser.data.email;
        $scope.contact.message = '';
      } else {
        $scope.contact = {};
      }


      if (!_.isEmpty(Message)) {
        $scope.messages = Message;
        $timeout(function () {
          $('.smaller-chat').scrollTop($('.smaller-chat')[0].scrollHeight);
        }, 1000);
      } else {
        $scope.messages = {};
      }

      $scope.discount = {
        "percent": 0
      };

      $scope.applyDiscount = function () {
        if (!$scope.discount_code) {
          $scope.invalidDiscount = $rootScope.T.transDiscountErr;
          return false;
        }
        Discount.getDiscount($scope.discount_code, currentUser.data.id, $scope.property.id).then(function (discount) {
          if (discount.length) {
            $scope.discount = discount[0];
          } else {
            $scope.discount = {
              "percent": 0
            };
            $scope.discount_code = $rootScope.T.transDiscountErr;
          }
        });
      };

      if ($stateParams.discount) {
        $scope.discount_code = $stateParams.discount;
        $scope.applyDiscount();
      }

      $scope.book = function () {
        //console.log("check 1");

        if (!$scope.checkin || !$scope.checkout) {
          $('.arrival, .departure').data('dateRangePicker').open();
          //console.log("checkin1");
          return false;
        }
        if ($scope.property.minimDays > $scope.nights) {
          //console.log("checkin2");
          Modal.minimDays($scope.property.minimDays);
          return false;
        }
        //console.log("gobook");
        $state.go('book', {
          "id": $stateParams.id,
          "agent": $scope.refAgent ? $scope.refAgent.id : '',
          "discount": $scope.discount.code
        });
        // $state.go('book', {
        //   "id": $stateParams.id,
        //   "agent": $scope.refAgent ? $scope.refAgent.id : '',
        //   "discount": $scope.discount.code
        // });
        //console.log("gobook", $stateParams.id);
      };

      $scope.askQuestion = function () {
        $scope.chatdisabled = true;
        Contact.askQuestion($scope.contact, false, $scope.property.id).then(function (messages) {
          $scope.messages = messages;
          Modal.messageReceived();
          $scope.contact.message = '';
          $scope.chatdisabled = false;
        });
      };

      $scope.getDay = function (timestamp) {
        return Contact.getDay(timestamp);
      };

      $scope.getSubArray = function (array, start, end) {
        return array.slice(start, end);
      };

      $scope.ratings = Ratings.data;
      var ratings = 0;
      _.each($scope.ratings, function (rating, key) {
        ratings += rating.avgRating;
        if ($scope.ratings.length === key + 1) {
          $scope.stars = ratings / $scope.ratings.length;
        }
      });



      $scope.$on('mapInitialized', function (event, map) {
        var data = {
          address2: $scope.property.address2,
          address3: $scope.property.address3,
          name: $scope.property.name,
          featured: $scope.property.featured,
          unique: $scope.property.unique,
          gmapsdata: $scope.property.gmapsdata
        };
        gMaps.propertyMap(map, data);
      });

      $scope.openGallery = function () {
        Modal.openGallery($scope.property.images, $scope.property.unique);
      };

      $scope.rules = function () {
        Modal.rules($scope.translation);
      };

      $scope.cancellation = function () {
        Modal.cancellation();
      };

      $scope.openCalendar = function () {
        $('.arrival, .departure').data('dateRangePicker').open();
      };

      $rootScope.$on("datesChanged", function (event, dates) {
        var start = dates.checkin;
        var end = dates.checkout;
        console.log(dates.checkin);
        //console.log(Date.parse(dates.checkin) / 1000);
        //console.log(Date.parse(dates.checkout) / 1000);


        var connect = {
          method: 'POST',
          url: url,
          data: {
            "propertyID": PropertyData.data.property.unique,
            "checkin": Date.parse(start) / 1000,
            "checkout": Date.parse(end) / 1000
          }
        }
        $http(connect).then(function (response) {
          //console.log(response.data.priceFindResult);
          $scope.priceDay = response.data.priceFindResult.priceNight,
            $scope.nights = response.data.priceFindResult.nights
          $scope.checkin = start;
          $scope.checkout = end;

        }, function (err) {
          //console.log(err);
        });


        // $http.get(CONFIG.API_URL + '/getprice', {
        //   //Checkin and checkout
        //   params: {
        //     "property": $scope.property.id,
        //     "checkin": dates.checkin,
        //     "checkout": dates.checkout,
        //     "format": CONFIG.DEFAULT_DATE_FORMAT
        //   }
        // }).success(function (data) {
        //   $scope.priceDay = data.price;
        //   $scope.nights = data.nights;
        //  //console.log("nights",data.nights);
        // }).error(function(data){
        //   //console.log("Error",data);
        //   $scope.nights = (Date.parse(dates.checkout)-Date.parse(dates.checkin))/1000/86400

        // });        
        $scope.showPrices = true;
      });

      if ($stateParams.action === 'chat') {
        $('html,body').animate({
          scrollTop: $("chat").offset().top - 100
        });
      }

      $scope.scrollToChat = function () {
        $('html,body').animate({
          scrollTop: $("chat").offset().top - 100
        });
      };

      if ($stateParams.action === 'contact') {
        $('html,body').animate({
          scrollTop: $("chat").offset().top - 400
        });
        $("#txtChat").focus();
      }

    }]);
})();
(function () {
  "use strict";
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('rate', {
        url: '/rating/:id/',
        title: 'title_rate',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/rating/rate.html');
        },
        controller: "RatingCtrl",
        resolve: {
          Data: ["Booking", "Rating", "$q", "$stateParams", function (Booking, Rating, $q, $stateParams) {
            var d = $q.defer();
            var result = {};
            Booking.getDetails($stateParams.id).then(function (data) {
              result.booking = data.data;
              return Rating.getBookingRating($stateParams.id);
            }).then(function (data) {
              result.rating = data;
              d.resolve(result);
            }).catch(function (err) {
              d.reject(err, 404);
            });
            return d.promise;
          }]
        }
      });
    }])
    .factory("Rating", ["$http", "$q", "CONFIG", function ($http, $q, CONFIG) {
      return {
        save: function (rating) {
          rating.avgRating = Math.round((parseInt(rating.ratings[0]) + parseInt(rating.ratings[1]) + parseInt(rating.ratings[2])) / 3 * 2) / 2;
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/rating', rating).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });

          return d.promise;
        },
        getBookingRating: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/rating', {
              params: {
                "booking": id
              }
            })
            .then(function (response) {
              if (response.data.length) {
                d.resolve(response.data[0]);
              } else {
                d.resolve({});
              }
            }, function () {
              d.resolve();
            });

          return d.promise;
        },
        getRatings: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/rating', {
              params: {
                "active": true
              }
            })
            .then(function (response) {
              d.resolve(response);
            }, function () {
              d.resolve();
            });

          return d.promise;
        },
        getPropertyRatings: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/rating', {
              params: {
                "active": true,
                "property": id
              }
            })
            .then(function (response) {
              d.resolve(response);
            }, function (err) {
              d.reject(err);
            });

          return d.promise;
        },
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/rating', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/rating', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/rating/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/rating/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/rating/', {
            params: {
              details: true,
              id: id
            }
          }).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        }
      };

	}])
    .controller('RatingCtrl', ['Data', 'Discount', 'Modal', 'Rating', '$scope', function (Data, Discount, Modal, Rating, $scope) {
      $scope.data = Data.booking;
      if (Data.rating.id) {
        $scope.rating = Data.rating;
        $scope.ty = true;
        Discount.find({
          booking: Data.booking.id
        }).then(function (data) {
          $scope.discount = data;
        });
      } else {
        $scope.rating = {
          property: $scope.data.property.id,
          booking: $scope.data.id,
          ratings: [3, 3, 3],
          active: false,
          user: $scope.data.user.id,
          date: moment().unix(),
          avgRating: 3
        };

      }
      $scope.save = function () {
        Rating.save($scope.rating).then(function () {
          Modal.rating();
          Discount.generate($scope.data.user.email, $scope.data.id).then(function (data) {
            $scope.rating = data;
          });
          $scope.ty = true;
        }).catch(function (e) {
          Modal.throwError(JSON.stringify(e.data.errors));
        });
      };
    }])
    .directive('ratings', ['$templateCache', function ($templateCache) {
      return {
        template: function () {
          return $templateCache.get('templates/thaihome/ratings/index.html');
        }
      };
    }])
    .directive('stars', ['$templateCache', function ($templateCache) {
      return {
        restrict: 'E',
        template: function () {
          return $templateCache.get('templates/thaihome/ratings/stars.html');
        },
        scope: {
          stars: "@stars"
        },
        link: function (scope) {
          scope.times = function (t) {
            if (t > 0) {
              return new Array(t);
            }
          };
          scope.Math = Math;
          scope.fullstars = function () {
            return Math.floor(scope.stars);
          };
          scope.halfstars = function () {

            var c = parseFloat(scope.stars) - parseFloat(scope.fullstars());
            if (c > 0) {
              return 1;
            } else {
              return 0;
            }
          };
          scope.emptystars = function () {
            return parseInt(5 - parseInt(scope.fullstars()) - parseInt(scope.halfstars()));
          };
        }
      };
    }])
    .directive('starRating',
      function () {
        return {
          restrict: 'A',
          template: '<ul class="rating" ng-class="{readonly: rating.id}">' + '	<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' + '\u2605' + '</li>' + '</ul>',
          scope: {
            ratingValue: '=',
            max: '=',
            onRatingSelected: '&'
          },
          link: function (scope) {
            var updateStars = function () {
              scope.stars = [];
              for (var i = 0; i < scope.max; i++) {
                scope.stars.push({
                  filled: i < scope.ratingValue
                });
              }
            };

            scope.toggle = function (index) {
              scope.ratingValue = index + 1;
              scope.onRatingSelected({
                rating: index + 1
              });
            };


            scope.$watch('ratingValue',
              function (oldVal, newVal) {
                if (newVal) {
                  updateStars();
                }
              }
            );
          }
        };
      });
})();
(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("Receipt", ['CONFIG', '$http', '$q', '$templateCache', '$rootScope', function (CONFIG, $http, $q, $templateCache, $rootScope) {
      return {
        add: function (params) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/receipt/', params).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        update: function (params) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/receipt/' + params.id, params).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        getAll: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/receipt/').then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/receipt/' + id).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
      };
    }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('sale', {
        url: '/sale/:id/',
        title: 'title_property',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/sale/index.html');
        },
        controller: 'PropertyCtrl',
        resolve: {
          currentUser: ['Auth', '$q', function (Auth, $q) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              d.resolve(data);
            }).catch(function (err) {
              d.resolve({});
            });

            return d.promise;
          }],
          Agent: ['$q', '$stateParams', 'User', 'Locale', function ($q, $stateParams, User, Locale) {
            var d = $q.defer();
            if ($stateParams.agent) {
              User.getDetails($stateParams.agent).then(function (data) {
                if (data.type === 'agent') {
                  d.resolve(data);
                  Locale.setAgent(data.id);
                } else {
                  d.resolve(false);
                }
              }).catch(function () {
                d.resolve(false);
              });

            } else if (Locale.getAgent()) {
              User.getDetails(Locale.getAgent()).then(function (data) {
                if (data.data.type === 'agent') {
                  d.resolve(data.data);
                } else {
                  d.resolve(false);
                }
              }).catch(function () {
                d.resolve(false);
              });
            }
            else{
              d.resolve(false);
            }

            return d.promise;
          }],
          PropertyData: ["Property", "$q", "$stateParams", function (Property, $q, $stateParams) {
            var deferred = $q.defer();
            Property.getDetails($stateParams.id).then(function (data) {
              deferred.resolve(data);
            }).catch(function (err) {
              deferred.reject(err, 404);
            });
            return deferred.promise;
          }],
          Ratings: ["Rating", "$q", "$stateParams", function (Rating, $q, $stateParams) {
            var d = $q.defer();
            Rating.getPropertyRatings($stateParams.id).then(function (data) {
              d.resolve(data);
            });
            return d.promise;
          }],
          Message: ['Contact', '$q', 'Auth', function (Contact, $q, Auth) {
            var d = $q.defer();
            Auth.checkLogged().then(function (data) {
              Contact.getMessage(null, data.data.id, null).then(function (data) {
                d.resolve(data);
              }).catch(function (err) {
                d.resolve({
                  data: []
                });
              });
            });

            return d.promise;
          }]
        }
      });
    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('search', {
        url: '/search/:location/',
        title: 'title_search',
        css: '/css/style.css',
        templateProvider: function ($templateCache) {
          return $templateCache.get('templates/thaihome/search/index.html');
        },
        params: {
          sortBy: '-price'
        },
        controller: 'SearchCtrl',
        resolve: {
          Results: ["Search", "$q", "$stateParams", "Locale", function (Search, $q, $stateParams, Locale) {
            var dates = Locale.getDates();
            var deferred = $q.defer();
            console.log(" DATES : ", dates);
            if (dates.valid) {
              var checkin = dates.checkin;
              var checkout = dates.checkout;
            } else {
              deferred.reject('Dates not set', 401);
            }

            Search.getResults($stateParams.location, checkin, checkout).then(function (data) {
              deferred.resolve(data);
              console.log(data);
            }).catch(function (err) {
              deferred.reject(err, 404);
            });
            return deferred.promise;
          }],
          Locations: ["$q", "$http", "CONFIG", function ($q, $http, CONFIG) {
            var deferred = $q.defer();
            $http.get(CONFIG.API_URL + '/location').then(function (data) {
                deferred.resolve(data);

              })
              .catch(function (err) {
                deferred.reject(err, 404);
              });
            return deferred.promise;
          }]
        }
      });
    }])
    .factory("Search", ["$http", "$q", "CONFIG", function ($http, $q, CONFIG) {
      return {
        getResults: function (location, checkin, checkout) {
          var defer = $q.defer();
          if (!checkin || !checkout) {
            defer.reject();
          } else {
            var language = localStorage.getItem('locale');
            if (!language) {
              language = 'gb'
            }
            $http.get(CONFIG.API_URL + '/search-booking/', {
                params: {
                  "location": location,
                  "checkin": checkin,
                  "checkout": checkout,
                  "language": language,
                  "format": CONFIG.DEFAULT_DATE_FORMAT
                }
              })
              .then(function (response) {
                defer.resolve(response);
              }, function (err) {
                defer.reject(err);
              });
          }

          return defer.promise;
        }
      };

    }])
    .controller('SearchCtrl', ['Modal', '$http', '$scope', 'Results', 'Locations', 'Calendar', '$rootScope', 'CONFIG', 'gMaps', '$stateParams', '$state', 'Locale', '$timeout', function (Modal, $http, $scope, Results, Locations, Calendar, $rootScope, CONFIG, gMaps, $stateParams, $state, Locale, $timeout) {

      Calendar.loadCalendar();
      $scope.locations = Locations.data;

      $scope.limits = {
        free: 10,
        booked: 0,
        increment: 10
      };


      $scope.sortBy = $stateParams.sortBy || '-price';

      $scope.search = function () {
        $state.go('search', {
          "location": $scope.location ? $scope.location : 0,
          "sortBy": $scope.sortBy
        }, {
          reload: true
        });
      };

      $scope.translations = Results.data.translations;
      $scope.location = $stateParams.location;
      $scope.freeProperties = Results.data.free;
      $scope.artificial = Results.data.artificial;
      $scope.bookedProperties = Results.data.booked;
      var dates = Locale.getDates();
      $scope.days = parseInt(moment(dates.checkout, CONFIG.DEFAULT_DATE_FORMAT).diff(dates.checkin, 'days'));
      var availableCount = $scope.freeProperties.length + $scope.bookedProperties.length;

      $scope.availableCount = availableCount;
      // console.log(Results.data.translations);


      var url = CONFIG.HELPER_URL + "/price/getPrice/";
      var objnewprice = [];

      angular.forEach(Results.data.translations, function (value, key) {
        // console.log("Key is",key,"value ",value);
        var connect = {
          method: 'POST',
          url: url,
          data: {
            "propertyID": key,
            "checkin": Date.parse(dates.checkin) / 1000,
            "checkout": Date.parse(dates.checkout) / 1000
          }
        }
        $http(connect).then(function (response) {
          //console.log("Success", response.data);
          objnewprice.push({
            "property": key,
            "price": response.data.priceFindResult.priceNight,
            "id": key
          });
          

        }, function (err) {
          console.log("Err", err);
        });

      });
      console.log(objnewprice);
      $scope.prices = objnewprice;



      if ($scope.location != 0) {
        $scope.locationName = _.findWhere($scope.locations, {
          id: $scope.location
        }).name;
      } else {
        $scope.locationName = 'All Locations';
      }


      $scope.$on('mapInitialized', function (event, map) {
        gMaps.searchMap(map, $scope.freeProperties, $scope.bookedProperties, $scope.prices);
      });

      $scope.increaseLimit = function () {
        $scope.removeWatch();
        $scope.limits.free = $scope.limits.free + $scope.limits.increment;
        if ($scope.freeProperties.length <= $scope.limits.free) {
          $scope.limits.booked += $scope.limits.increment;
        }
        $scope.watchPhoto();
      };


      if ($scope.freeProperties.length < $scope.limits.free) {
        $scope.limits.booked += $scope.limits.increment;
      }

      $scope.removeWatch = function () {
        jQuery('.offer').off('mouseenter');
        jQuery('.offer').off('mouseleave');
        jQuery('.img_switch_left, .img_switch_right').off('click');
      };

      $scope.watchPhoto = function () {
        $timeout(function () {
          jQuery(document).ready(function () {
            jQuery('.offer').mouseenter(function () {
              jQuery(this).find('.img_switch_left, .img_switch_right').show();
            });
            jQuery('.offer').mouseleave(function () {
              jQuery('.img_switch_left, .img_switch_right').hide();
            });
            jQuery('.img_switch_left, .img_switch_right').click(function (e) {
              var img = jQuery(this).parent('.prop_img_cont').find('img.offerimg');
              var property = jQuery(img).attr('property');
              var direction = parseInt(jQuery(this).attr('direction'));
              $scope.switchPhoto(property, img, direction);
            });

          });
        });
      };



      $scope.switchPhoto = function (prop, el, direction) {
        var property = _.findWhere($scope.freeProperties, {
          unique: prop.toUpperCase()
        });

        if (!property) {
          property = _.findWhere($scope.bookedProperties, {
            unique: prop.toUpperCase()
          });
        }

        var photos = property.images;
        var current_photo = jQuery(el).attr('src');
        current_photo = current_photo.split('/');
        current_photo = current_photo[current_photo.length - 1];
        var current_index = parseInt(photos.indexOf(current_photo));
        var newPhoto = photos[0];
        if (direction && photos[current_index + 1]) {
          newPhoto = photos[current_index + 1];
        } else if (direction && !photos[current_index + 1]) {
          newPhoto = photos[0];
        } else if (!direction && photos[current_index - 1]) {
          newPhoto = photos[current_index - 1];
        } else {
          newPhoto = photos[photos.length - 1];
        }
        var newSrc = jQuery(el).attr('src').replace(current_photo, newPhoto);
        jQuery(el).attr('src', newSrc);
      };

      $scope.swipe = function (direction, el) {
        var img = jQuery(el.target);
        var p = jQuery(img).attr('property');
        //p = p && p.unique || p;
        $scope.switchPhoto(p, img, direction);
      };

      $scope.watchPhoto();

    }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('Season', ['$http', 'CONFIG', '$q', function ($http, CONFIG, $q) {
      return {
        getAll: function (query) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/season', {
            params: query
          }).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/season', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/season/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/season/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/season/' + id).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        },
        list: function () {
          return ['BASE', 'LOW', 'MEDIUM', 'HIGH', 'SUPER'];
        }
      };
    }]);
})();
(function () {
  "use strict";
  angular.module('ThaiHome')
    .factory("Todo", ['CONFIG', '$http', '$q', '$templateCache', '$rootScope', function (CONFIG, $http, $q, $templateCache, $rootScope) {
      return {
        add: function (params) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/todo/', params).then(function (result) {
              d.resolve(result.data);
          });
          return d.promise;
        },
        update: function (params) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/todo/' + params.id, params).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        list: function () {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/todo').then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/todo/' + id).then(function (result) {
            d.resolve(result.data);
          });
          return d.promise;
        },
      };
    }]);
})();

(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('Token', [function () {
      function genToken() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 20; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
      }
      return {
        genToken: genToken
      };
  }]);
})();
(function () {
  'use strict';
  angular.module('ThaiHome')
    .factory('Translation', ['$http', 'CONFIG', '$q', 'dpd', function ($http, CONFIG, $q, dpd) {
      return {
        getAll: function (query) {
          var d = $q.defer();
          dpd.translation.get(query).then(function (data) {
            d.resolve(data.data);
          }).catch(function (err) {
            d.reject(err);
          });

          return d.promise;
        },
        add: function (data) {
          var d = $q.defer();
          $http.post(CONFIG.API_URL + '/translation', data).then(function (data) {
            d.resolve(data);
          }).catch(function (err) {
            d.reject(err);
          });
          return d.promise;
        },
        update: function (id, data) {
          var d = $q.defer();
          $http.put(CONFIG.API_URL + '/translation/' + id, data).then(function (data) {
            d.resolve(data.data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        delete: function (id) {
          var d = $q.defer();
          $http.delete(CONFIG.API_URL + '/translation/' + id).then(function (data) {
            d.resolve(data);
          }).catch(function (e) {
            d.reject(e);
          });
          return d.promise;
        },
        getDetails: function (id) {
          var d = $q.defer();
          $http.get(CONFIG.API_URL + '/translation/' + id).then(function (data) {
            if (_.isObject(data.data) && data.data.id) {
              d.resolve(data.data);
            } else if (data.data.length) {
              d.resolve(data.data[0]);
            } else {
              d.reject();
            }
            return d.promise;
          });
          return d.promise;

        }
      };
    }]);
})();
(function () {
    'use strict';
    angular.module('ThaiHome')
        .controller('UserCtrl', ["$scope", "Auth", function ($scope, Auth) {
            $scope.credentials = {
                "email": "",
                "password": ""
            };

            $scope.login = function () {
                Auth.login($scope.credentials);
            };


        }])
        .factory('User', ['$http', 'CONFIG', '$q', '$rootScope', 'Token', function ($http, CONFIG, $q, $rootScope, Token) {
            return {
                getAll: function (query) {
                    var d = $q.defer();
                    $http.get(CONFIG.API_URL + '/users', {
                        params: query
                    }).then(function (data) {
                        d.resolve(data.data);
                    }).catch(function (err) {
                        d.reject(err);
                    });

                    return d.promise;
                },
                add: function (data) {
                    var d = $q.defer();
                    data.created = moment().unix();
                    data.lastContact = moment().unix();
                    $http.post(CONFIG.API_URL + '/users', data).then(function (data) {
                        d.resolve(data);
                    }).catch(function (err) {
                        d.reject(err);
                    });
                    return d.promise;
                },
                update: function (id, data) {
                    var d = $q.defer();
                    $http.put(CONFIG.API_URL + '/users/' + id, data).then(function (data) {
                        d.resolve(data.data);
                    }).catch(function (e) {
                        d.reject(e);
                    });
                    return d.promise;
                },
                delete: function (id) {
                    var d = $q.defer();
                    $http.delete(CONFIG.API_URL + '/users/' + id).then(function (data) {
                        d.resolve(data);
                    }).catch(function (e) {
                        d.reject(e);
                    });
                    return d.promise;
                },
                getDetails: function (id, email) {
                    var d = $q.defer();
                    if (id) {
                        $http.get(CONFIG.API_URL + '/users/' + id).then(function (data) {
                            if (_.isObject(data.data) && data.data.id) {
                                d.resolve(data.data);
                            } else if (data.data.length) {
                                d.resolve(data.data[0]);
                            } else {
                                d.reject();
                            }
                            return d.promise;
                        });
                    } else if (email) {
                        $http.get(CONFIG.API_URL + '/users', {
                            params: {
                                email: email
                            }
                        }).then(function (data) {
                            if (_.isObject(data.data) && data.data.id) {
                                d.resolve(data.data);
                            } else if (data.data.length) {
                                d.resolve(data.data[0]);
                            } else {
                                d.reject();
                            }
                        });
                    } else {
                        d.reject();
                    }
                    return d.promise;

                },
                getOne: function (email, data, full) {
                    var d = $q.defer();
                    $http.get(CONFIG.API_URL + '/users', {
                        "params": {
                            "email": email
                        }
                    }).then(function (user) {

                        var token = Token.genToken();
                        if (user && user.data && user.data[0]) {
                            var update = user.data[0];
                            if (data.phone) update.phone = data.phone;
                            if (data.name) update.name = data.name;
                            if (data.country) update.country = data.country;
                            if (update.agent) update.agent = data.agent;
                            $http.put(CONFIG.API_URL + '/users/' + update.id, update);
                            /**
                             Start 2016-05-27 - Ajay - For logout issue
                             */
                            if (!$rootScope.admin) {
                                localStorage.setItem('auth', token);
                            }
                            /**
                             END
                             */
                            var updateUser = user.data[0];
                            updateUser.auth = token;
                            $http.put(CONFIG.API_URL + '/users/' + updateUser.id, updateUser).then(function () {
                                if (full) {
                                    d.resolve(user.data[0]);
                                } else {
                                    d.resolve(user.data[0].id);
                                }
                            }).catch(function () {
                                d.resolve(false);
                            });

                        } else if (data) {
                            var newUser = {
                                "email": data.email,
                                "password": data.email,
                                "name": data.name,
                                "phone": data.phone,
                                "country": data.country,
                                "agent": data.agent ? data.agent : '',
                                "username": data.email,
                                "created": moment().unix(),
                                "lastContact": moment().unix(),
                                "type": "tenant",
                                "auth": token
                            };
                            localStorage.setItem('auth', token);
                            $http.post(CONFIG.API_URL + '/users', newUser).then(function (newuser) {
                                if (full) {
                                    d.resolve(newuser.data);
                                } else {
                                    d.resolve(newuser.data.id);
                                }
                            });
                        } else {
                            d.resolve(false);
                        }
                    }).catch(function (err) {
                        d.reject(err);
                    });
                    return d.promise;
                },
                autoLoginTenant: function (email) {
                    var d = $q.defer();
                    $http.post(CONFIG.API_URL + '/users/login', {
                        "username": email,
                        "password": email
                    }).then(function () {
                        d.resolve();
                    }).catch(function () {
                        d.resolve();
                    });
                    return d.promise;
                },
                userTypes: function () {
                    return [
                        {
                            value: 'tenant',
                            text: 'tenant'
                        },
                        {
                            value: 'agent',
                            text: 'agent'
                        },
                        {
                            value: 'admin',
                            text: 'admin/manager'
                        },
                        {
                            value: 'translator',
                            text: 'translator'
                        }
                    ];

                }
            };
        }]);
})();
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