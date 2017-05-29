if(ctx.method == 'POST' && ctx.body.type == 'tenant' && !ctx.body.password && !internal){
    this.password = this.email;
}
console.log(ctx.body);
