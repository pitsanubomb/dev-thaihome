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