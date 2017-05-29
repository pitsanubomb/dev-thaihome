if(ctx.method === 'GET'){
    ctx.query.$sort = {updated:1};
}