dpd.expense.get({}, function (expense, err) {
    var max = 0;
    if(expense.length){
        for(var i = 0; i < expense.length; i++){
            console.log("maxNumber ", expense[i].transactionNo);
            if(max < expense[i].transactionNo){
                max = expense[i].transactionNo;
            }
        }
    }
    max += 1;
    this.transactionNo = max;
});