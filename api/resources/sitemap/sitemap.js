var sm = require('sitemap');
var _ = require('underscore');
var URL = process().env.BASE_URL_ASSETS;
var fs = require('fs');
var path = require('path');
var root = process().cwd();

var urls = [];
var allUrls = ['contact/', 'about/', 'news/'];

dpd.property.get({
  $fields: {
    unique: 1
  }
}).then(function (properties) {
  _.each(properties, function (property) {
    urls.push({
      url: URL + 'property/' + property.unique + '/',
      changeFreg: 'daily',
      priority: 1
    });
  });
  var sitemap = sm.createSitemap({
    hostname: URL,
    cacheTime: 600000, // 600 sec - cache purge period 
    urls: urls
  });

  _.each(allUrls, function (u) {
    sitemap.add({
      url: URL + '' + u,
      changefreq: 'monthly',
      priority: 0.7
    });
  });
  var fs = require('fs');
  fs.writeFile(path.join(root, 'public/sitemap.xml'), sitemap.toString(), function (err) {
    if (err) {
      console.log(err);
    }
    console.log('Sitemap Created');
  });
});