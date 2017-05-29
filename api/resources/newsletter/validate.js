dpd.newsletter.get({email: ctx.body.email}, function(data){
    if(data.length){
        cancel('duplicate', true);
    }
})