var uuid = require('node-uuid');
var fs = require('fs');
var pdf = require('html-pdf');

$addCallback();
var options = {"width":"800","height":"1200","zoomFactor": "1"};
var filename = 'balance.pdf';
var html = ctx.body.html;
pdf.create(ctx.body.html, options).toFile('public/assets/voucherPDF/' + filename, function(err, res) {
  if (err) return console.log(err);
  console.log(filename);
  setResult({'filename': filename});
  $finishCallback();
});
