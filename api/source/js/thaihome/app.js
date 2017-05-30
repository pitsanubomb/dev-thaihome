(function () {
  'use strict';
  angular
    // What does the modules do?
    //  angularMoment   - Date manipulation "moment"
    //  ngRoute         - Angular Route 
    //  ngMap           - Used to map data 
    //  
    // Stuff we might want to remove:
    // - vcRecaptcha  (we do not use recaptcha)
    // - datatables (for searching/sorting tables in html)
    //
    //
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

      // Show both currencies
      // Example:  ฿30,000 ($1000)
      // price      - Amount 
      // currency   - Currency for the Amount
      // rate       - The rate from currencydata table 
      // format     - "left" is use the left side or first amount/currency  ฿30,000
      //            - "both" is use both amount/currency  ฿30,000 ($1000)
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
