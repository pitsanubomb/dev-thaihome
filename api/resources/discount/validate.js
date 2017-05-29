var _ = require('underscore');
if(_.isObject(this.user) && !_.isEmpty(this.user)){
  this.user = this.user.id;
}

if(_.isObject(this.property) & !_.isEmpty(this.property)){
  this.property = this.property.id;
}