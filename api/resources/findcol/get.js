$addCallback();
var collection = query.collection,
  property = query.property,
  value = query.value;

var customQuery = {};



customQuery[property] = value;
if(collection=='currency'){
customQuery['active'] = true;    
}
customQuery.$limit = 1;

dpd[collection].get(customQuery, function (result, err) {
  if (err) return setResult({});
  if (result.length) {
    setResult(result[0]);
  } else {
    setResult({});
  }
  $finishCallback();
});