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
