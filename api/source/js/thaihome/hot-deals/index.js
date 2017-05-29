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
