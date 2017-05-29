var _ = require('underscore');
if(_.isObject(this.property) && !_.isEmpty(this.property)){
  this.property = this.property.id;
}