var uuid = require('node-uuid');
var fs = require('fs');
var pdf = require('html-pdf');

$addCallback();
var options = {"width":"690","height":"950","zoomFactor": "1"};
var filename = 'voucher.pdf';
var html = query.url;
pdf.create(query.url, options).toFile('public/assets/voucherPDF/' + filename, function(err, res) {
  if (err) return console.log(err);
  console.log(filename);
  setResult({'filename': filename});
  $finishCallback();
});

/*
 phantom.create().then(function (ph) {
 ph.createPage().then(function (page) {
 page.property('viewportSize', {width: 1200, height: 600}).then(function () {
 page.open('https://www.google.am/').then(function (status) {
 if (status === "success") {
 if (!fs.existsSync('public/assets/voucherPDF')) {
 fs.mkdirSync('public/assets/voucherPDF');
 }
 var filename = uuid.v4() + '.pdf';
 console.log('TIMEOUT AREA ___________________________________');
 page.render('public/assets/voucherPDF/' + filename).then(function () {
 console.log('filename is : ', filename);
 setResult({'filename': filename});
 ph.exit();
 $finishCallback();
 })
 } else {
 console.log('errorrrrrrrrrrrrrrrrrrrrrrrrr.');
 }
 });
 });
 });
 });
 */
