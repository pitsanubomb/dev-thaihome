var multiparty = require('multiparty');
var _ = require('underscore');
var fs = require('fs');
var form = new multiparty.Form();
var Promise = require('bluebird');
var easyimg = require('easyimage');
var options = {
  width: 810,
  height: 450,
  quality: 100
};

$addCallback();

var getter = function (id) {
  return new Promise(function (resolve, reject) {
    dpd.property.get({
      "id": id
    }, function (data) {
      if (data.length === 0) return reject('No Data');
      resolve(data);
    });
  });
};

var updater = function (property) {
  return new Promise(function (resolve, reject) {
    dpd.property.post(property).then(function (data) {
      resolve(data);
    });
  });
};

var processImg = function (img) {
  return new Promise(function (resolve, reject) {
    easyimg.info(img).then(function (info) {
      var opts = {
        src: img,
        dst: img,
        quality: options.quality,
        width: options.width
      };
      return easyimg.resize(opts);
    }).then(function () {
      var optsCrop = {
        src: img,
        dst: img,
        quality: options.quality,
        cropwidth: options.width,
        cropheight: options.height
      };
      return easyimg.crop(optsCrop);
    }).then(function (data) {
      resolve();
    }).catch(reject);
  });
};

form.parse(ctx.req, function (err, fields, files) {
  if (_.keys(files).length) {
    var filename = fields.unique.toString() + '_' + new Date().getTime() + '.' + files.file[0].originalFilename.substr(files.file[0].originalFilename.lastIndexOf('.') + 1);
    var dir = 'public/assets/images/property/' + fields.unique.toString().toLowerCase() + '/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    getter(fields.id.toString()).then(function (property) {
      if (!property.images) {
        property.images = [];
      }
      property.images.push(filename);
      property.images = _.uniq(property.images);
      return updater(property);
    }).then(function () {
      return fs.createReadStream(files.file[0].path).pipe(fs.createWriteStream(dir + files.file[0].originalFilename));
    }).then(function () {
      return fs.renameSync(dir + files.file[0].originalFilename, dir + filename);
    }).then(function (data) {
      return processImg(dir + filename);
    }).then(function () {
      setResult({
        "success": true,
        "filename": filename
      });
      $finishCallback();
    }).catch(function (err) {
      setResult({
        "success": false,
        "error": err
      });
      $finishCallback();
    });
  }

});