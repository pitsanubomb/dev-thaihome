var _ = require('underscore');

if(_.isObject(ctx.body.location) && ctx.body.location.id){
    this.location = ctx.body.location.id;
}