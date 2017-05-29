$addCallback();

if (ctx.body.Event == 'DELETE' && ctx.body.Collection !== '') {
	if (ctx.body.Type == 'All') {
    dpd[ctx.body.Collection].del({id:{$ne: null}}, function (result, err) {if (err) return setResult({});
          if (result.length) {
            setResult(result[0]);
          } else {
            setResult({});
          }
          $finishCallback();
        });
	} 
	
	if (ctx.body.Type == 'Selected') {	
		dpd[ctx.body.Collection].del({id: {$in: ctx.body.ids}}, function (result, err) {
          if (err) return setResult({});
          if (result.length) {
            setResult(result[0]);
          } else {
            setResult({});
          }
          $finishCallback();
        });
	} 

}