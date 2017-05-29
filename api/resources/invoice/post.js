dpd.invoice.get({}, function (invoices, err) {
  console.log("ALL INVOICES", invoices);
  var max = 0;
  for(var i = 0; i < invoices.length; i++){
    console.log("maxNumber ", invoices[i].invoiceNumber);
    if(max < invoices[i].invoiceNumber){
      max = invoices[i].invoiceNumber;
    }
  }
  max += 1;
  this.invoiceNumber = max;
});
