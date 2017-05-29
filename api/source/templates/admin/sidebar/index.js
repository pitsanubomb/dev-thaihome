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
          name: 'Languages',
          icon: 'fa-flag',
          sref: 'admin.languages',
          childs: [
          ]
        },
        {
          name: 'Inspection',
          icon: 'fa-id-card-o',
          sref: 'admin.inspection',
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
          sref: '#',
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
          sref: '#',
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
