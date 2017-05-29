var fs = require('fs');
var filePath = 'public/assets/voucherPDF/'+ctx.body.filename; 
fs.unlink(filePath);