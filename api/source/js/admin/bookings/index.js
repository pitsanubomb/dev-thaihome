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