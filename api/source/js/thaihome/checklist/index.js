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
