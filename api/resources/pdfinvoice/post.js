var uuid = require('node-uuid');
var fs = require('fs');
var pdf = require('html-pdf');

$addCallback();
var options = {"width":"660","height":"950","zoomFactor": "1"};
var filename = 'invoice' + ctx.body.number +  '.pdf';
var html = ctx.body.url;
pdf.create(ctx.body.url, options).toFile('public/assets/voucherPDF/' + filename, function(err, res) {
  if (err) return console.log(err);
  console.log(filename);
  setResult({'filename': filename});
  $finishCallback();
});
