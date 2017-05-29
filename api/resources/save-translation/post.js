var fs = require('fs');
var _ = require('underscore');


if (ctx.body.data && _.isObject(ctx.body.data) && ctx.body.shortname) {
  var file = 'public/translations/' + ctx.body.shortname.toLowerCase() + '.json';

  fs.writeFile(file, JSON.stringify(ctx.body.data, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
  });
}