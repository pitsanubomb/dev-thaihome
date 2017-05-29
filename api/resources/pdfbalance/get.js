var uuid = require('node-uuid');
var fs = require('fs');
var pdf = require('html-pdf');

$addCallback();
var options = {"width":"800","height":"650","zoomFactor": "1"};
var filename = 'balance.pdf';
var html = query.url;
pdf.create(query.url, options).toFile('public/assets/voucherPDF/' + filename, function(err, res) {
  if (err) return console.log(err);
  console.log(filename);
  setResult({'filename': filename});
  $finishCallback();
});
