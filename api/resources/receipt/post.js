dpd.receipt.get({}, function (receipts, err) {
  console.log("ALL RECeipts", receipts);
  var max = 0;
  for(var i = 0; i < receipts.length; i++){
    console.log("maxNumber ", receipts[i].receiptNo);
    if(max < receipts[i].receiptNo){
      max = receipts[i].receiptNo;
    }
  }
  max += 1;
  this.receiptNo = max;
});
