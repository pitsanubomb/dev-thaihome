//  Very cool date.format function
//  console.log (new Date().format('Y-m-d h:i:s'));  =  2017-03-09 10:33:35
//	console.log (new Date().format('U')); = 1489030415
//  console.log('checkout ' + new Date(selectBooking[0].checkout*1000).format('Y-m-d h:i:s'))
//  see https://github.com/JDMcKinstry/JavaScriptDateFormat/blob/master/README.md
;(function(){function g(a,c){a.setHours(a.getHours()+parseFloat(c));return a}function h(a,c){var b="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ");return c?b[a.getDay()].substr(0,3):b[a.getDay()]}function k(a,c){var b="January February March April May June July August September October November December".split(" ");return c?b[a.getMonth()].substr(0,3):b[a.getMonth()]}function e(a,c){if(a){if("compound"==a){if(!1===c)return this.format.compound;var b={},d;for(d in Date.prototype.format.compound)b[d]=
this.format(Date.prototype.format.compound[d]);return b}if(Date.prototype.format.compound[a])return this.format(Date.prototype.format.compound[a],c);if("constants"==a){if(!1===c)return this.format.constants;b={};for(d in Date.prototype.format.constants)b[d]=this.format(Date.prototype.format.constants[d]);return b}if(Date.prototype.format.constants[a])return this.format(Date.prototype.format.constants[a],c);if("pretty"==a){if(!1===c)return this.format.pretty;b={};for(d in Date.prototype.format.pretty)b[d]=
this.format(Date.prototype.format.pretty[d]);return b}if(Date.prototype.format.pretty[a])return this.format(Date.prototype.format.pretty[a],c);var b=a.split(""),e="";for(d in b){var f=b[d];f&&/[a-z]/i.test(f)&&!/\\/.test(e+f)&&(b[d]=l[f]?l[f].apply(this):f);e=b[d]}return b.join("").replace(/\\/g,"")}return a}var l={d:function(){var a=this.getDate();return 9<a?a:"0"+a},D:function(){return h(this,!0)},j:function(){return this.getDate()},l:function(){return h(this)},N:function(){return this.getDay()+
1},S:function(){var a=this.getDate();return/^1[0-9]$/.test(a)?"th":/1$/.test(a)?"st":/2$/.test(a)?"nd":/3$/.test(a)?"rd":"th"},w:function(){return this.getDay()},z:function(){return Math.round(Math.abs((this.getTime()-(new Date("1/1/"+this.getFullYear())).getTime())/864E5))},W:function(){var a=new Date(this.getFullYear(),0,1);return Math.ceil(((this-a)/864E5+a.getDay()+1)/7)},F:function(){return k(this)},m:function(){var a=this.getMonth()+1;return 9<a?a:"0"+a},M:function(){return k(this,!0)},n:function(){return this.getMonth()+
1},t:function(){return(new Date(this.getFullYear(),this.getMonth()+1,0)).getDate()},L:function(){var a=this.getFullYear();return 0==a%4&&0!=a%100||0==a%400},o:function(){return parseInt(this.getFullYear())},Y:function(){return parseInt(this.getFullYear())},y:function(){return parseInt((this.getFullYear()+"").substr(-2))},a:function(){return 12<=this.getHours()?"pm":"am"},A:function(){return 12<=this.getHours()?"PM":"AM"},B:function(){return"@"+("00"+Math.floor((60*((this.getHours()+1)%24*60+this.getMinutes())+
this.getSeconds()+.001*this.getMilliseconds())/86.4)).slice(-3)},g:function(){var a=this.getHours();return 0==a?12:12>=a?a:a-12},G:function(){return this.getHours()},h:function(){var a=this.getHours(),a=12>=a?a:a-12;return 0==a?12:9<a?a:"0"+a},H:function(){var a=this.getHours();return 9<a?a:"0"+a},i:function(){var a=this.getMinutes();return 9<a?a:"0"+a},s:function(){var a=this.getSeconds();return 9<a?a:"0"+a},u:function(){return this.getMilliseconds()},e:function(){var a=this.toString().match(/ ([A-Z]{3,4})([-|+]?\d{4})/);
return 1<a.length?a[1]:""},I:function(){var a=new Date(this.getFullYear(),0,1),c=new Date(this.getFullYear(),6,1),a=Math.max(a.getTimezoneOffset(),c.getTimezoneOffset());return this.getTimezoneOffset()<a?1:0},O:function(){var a=this.toString().match(/ ([A-Z]{3,4})([-|+]?\d{4})/);return 2<a.length?a[2]:""},P:function(){var a=this.toString().match(/ ([A-Z]{3,4})([-|+]?\d{4})/);return 2<a.length?a[2].substr(0,3)+":"+a[2].substr(3,2):""},T:function(){return this.toLocaleString("en",{timeZoneName:"short"}).split(" ").pop()},
Z:function(){return 60*this.getTimezoneOffset()},c:function(){return g(new Date(this),-(this.getTimezoneOffset()/60)).toISOString()},r:function(){return g(new Date(this),-(this.getTimezoneOffset()/60)).toISOString()},U:function(){return this.getTime()/1E3|0}},m={commonLogFormat:"d/M/Y:G:i:s",exif:"Y:m:d G:i:s",isoYearWeek:"Y\\WW",isoYearWeek2:"Y-\\WW",isoYearWeekDay:"Y\\WWj",isoYearWeekDay2:"Y-\\WW-j",mySQL:"Y-m-d h:i:s",postgreSQL:"Y.z",postgreSQL2:"Yz",soap:"Y-m-d\\TH:i:s.u",soap2:"Y-m-d\\TH:i:s.uP",
unixTimestamp:"@U",xmlrpc:"Ymd\\TG:i:s",xmlrpcCompact:"Ymd\\tGis",wddx:"Y-n-j\\TG:i:s"},n={AMERICAN:"F j, Y",AMERICANSHORT:"m/d/Y",AMERICANSHORTWTIME:"m/d/Y h:i:sA",ATOM:"Y-m-d\\TH:i:sP",COOKIE:"l, d-M-Y H:i:s T",EUROPEAN:"j F Y",EUROPEANSHORT:"d.m.Y",EUROPEANSHORTWTIME:"d.m.Y H:i:s",ISO8601:"Y-m-d\\TH:i:sO",LEGAL:"j F Y",RFC822:"D, d M y H:i:s O",RFC850:"l, d-M-y H:i:s T",RFC1036:"D, d M y H:i:s O",RFC1123:"D, d M Y H:i:s O",RFC2822:"D, d M Y H:i:s O",RFC3339:"Y-m-d\\TH:i:sP",RSS:"D, d M Y H:i:s O",
W3C:"Y-m-d\\TH:i:sP"},p={"pretty-a":"g:i.sA l jS \\o\\f F, Y","pretty-b":"g:iA l jS \\o\\f F, Y","pretty-c":"n/d/Y g:iA","pretty-d":"n/d/Y","pretty-e":"F jS - g:ia","pretty-f":"g:iA","pretty-g":"F jS, Y","pretty-h":"F jS, Y g:mA"};Object.defineProperty?Object.defineProperty(e,"compound",{value:m}):e.compound=m;Object.defineProperty?Object.defineProperty(e,"constants",{value:n}):e.constants=n;Object.defineProperty?Object.defineProperty(e,"pretty",{value:p}):e.pretty=p;Object.defineProperty&&!Date.prototype.hasOwnProperty("format")?
Object.defineProperty(Date.prototype,"format",{value:e}):Date.prototype.format=e})();

// 	console.log (dateFormat(new Date('2017-02-01 00:00:00'), 'U'));
//	console.log (Date.parse('2017-02-01 00:00:00')/1000);
;function dateFormat(g,c,k){function l(a,b){a.setHours(a.getHours()+parseFloat(b));return a}function m(a,b){var c="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ");return b?c[a.getDay()].substr(0,3):c[a.getDay()]}function n(a,b){var c="January February March April May June July August September October November December".split(" ");return b?c[a.getMonth()].substr(0,3):c[a.getMonth()]}var d={d:function(){var a=this.getDate();return 9<a?a:"0"+a},D:function(){return m(this,!0)},j:function(){return this.getDate()},
l:function(){return m(this)},N:function(){return this.getDay()+1},S:function(){var a=this.getDate();return/^1[0-9]$/.test(a)?"th":/1$/.test(a)?"st":/2$/.test(a)?"nd":/3$/.test(a)?"rd":"th"},w:function(){return this.getDay()},z:function(){return Math.round(Math.abs((this.getTime()-(new Date("1/1/"+this.getFullYear())).getTime())/864E5))},W:function(){var a=new Date(this.getFullYear(),0,1);return Math.ceil(((this-a)/864E5+a.getDay()+1)/7)},F:function(){return n(this)},m:function(){var a=this.getMonth()+
1;return 9<a?a:"0"+a},M:function(){return n(this,!0)},n:function(){return this.getMonth()+1},t:function(){return(new Date(this.getFullYear(),this.getMonth()+1,0)).getDate()},L:function(){var a=this.getFullYear();return 0==a%4&&0!=a%100||0==a%400},o:function(){return parseInt(this.getFullYear())},Y:function(){return parseInt(this.getFullYear())},y:function(){return parseInt((this.getFullYear()+"").substr(-2))},a:function(){return 12<=this.getHours()?"pm":"am"},A:function(){return 12<=this.getHours()?
"PM":"AM"},B:function(){return"@"+("00"+Math.floor((60*((this.getHours()+1)%24*60+this.getMinutes())+this.getSeconds()+.001*this.getMilliseconds())/86.4)).slice(-3)},g:function(){var a=this.getHours();return 0==a?12:12>=a?a:a-12},G:function(){return this.getHours()},h:function(){var a=this.getHours(),a=12>=a?a:a-12;return 0==a?12:9<a?a:"0"+a},H:function(){var a=this.getHours();return 9<a?a:"0"+a},i:function(){var a=this.getMinutes();return 9<a?a:"0"+a},s:function(){var a=this.getSeconds();return 9<
a?a:"0"+a},u:function(){return this.getMilliseconds()},e:function(){var a=this.toString().match(/ ([A-Z]{3,4})([-|+]?\d{4})/);return 1<a.length?a[1]:""},I:function(){var a=new Date(this.getFullYear(),0,1),b=new Date(this.getFullYear(),6,1),a=Math.max(a.getTimezoneOffset(),b.getTimezoneOffset());return this.getTimezoneOffset()<a?1:0},O:function(){var a=this.toString().match(/ ([A-Z]{3,4})([-|+]?\d{4})/);return 2<a.length?a[2]:""},P:function(){var a=this.toString().match(/ ([A-Z]{3,4})([-|+]?\d{4})/);
return 2<a.length?a[2].substr(0,3)+":"+a[2].substr(3,2):""},T:function(){return this.toLocaleString("en",{timeZoneName:"short"}).split(" ").pop()},Z:function(){return 60*this.getTimezoneOffset()},c:function(){return l(new Date(this),-(this.getTimezoneOffset()/60)).toISOString()},r:function(){return l(new Date(this),-(this.getTimezoneOffset()/60)).toISOString()},U:function(){return this.getTime()/1E3|0}},e={commonLogFormat:"d/M/Y:G:i:s",exif:"Y:m:d G:i:s",isoYearWeek:"Y\\WW",isoYearWeek2:"Y-\\WW",
isoYearWeekDay:"Y\\WWj",isoYearWeekDay2:"Y-\\WW-j",mySQL:"Y-m-d h:i:s",postgreSQL:"Y.z",postgreSQL2:"Yz",soap:"Y-m-d\\TH:i:s.u",soap2:"Y-m-d\\TH:i:s.uP",unixTimestamp:"@U",xmlrpc:"Ymd\\TG:i:s",xmlrpcCompact:"Ymd\\tGis",wddx:"Y-n-j\\TG:i:s"},h={AMERICAN:"F j, Y",AMERICANSHORT:"m/d/Y",AMERICANSHORTWTIME:"m/d/Y h:i:sA",ATOM:"Y-m-d\\TH:i:sP",COOKIE:"l, d-M-Y H:i:s T",EUROPEAN:"j F Y",EUROPEANSHORT:"d.m.Y",EUROPEANSHORTWTIME:"d.m.Y H:i:s",ISO8601:"Y-m-d\\TH:i:sO",LEGAL:"j F Y",RFC822:"D, d M y H:i:s O",
RFC850:"l, d-M-y H:i:s T",RFC1036:"D, d M y H:i:s O",RFC1123:"D, d M Y H:i:s O",RFC2822:"D, d M Y H:i:s O",RFC3339:"Y-m-d\\TH:i:sP",RSS:"D, d M Y H:i:s O",W3C:"Y-m-d\\TH:i:sP"},f={"pretty-a":"g:i.sA l jS \\o\\f F, Y","pretty-b":"g:iA l jS \\o\\f F, Y","pretty-c":"n/d/Y g:iA","pretty-d":"n/d/Y","pretty-e":"F jS - g:ia","pretty-f":"g:iA","pretty-g":"F jS, Y","pretty-h":"F jS, Y g:mA"};if(c){if("compound"==c){if(!1===k)return e;var d={},b;for(b in e)d[b]=dateFormat(g,e[b]);return d}if(e[c])return dateFormat(g,
e[c],k);if("constants"==c){if(!1===k)return h;d={};for(b in h)d[b]=dateFormat(g,h[b]);return d}if(h[c])return dateFormat(g,h[c],k);if("pretty"==c){if(!1===k)return f;d={};for(b in f)d[b]=dateFormat(g,f[b]);return d}if(f[c])return dateFormat(g,f[c],k);e=c.split("");h="";for(b in e)(f=e[b])&&/[a-z]/i.test(f)&&!/\\/.test(h+f)&&(e[b]=d[f]?d[f].apply(g):f),h=e[b];return e.join("").replace(/\\/g,"")}return g};



// Calculate amount of DAYS between two dates
function daysBetween(date1, date2) {
    var ONE_DAY = 1000 * 60 * 60 * 24
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()
    var difference_ms = Math.abs(date1_ms - date2_ms)
    return Math.round(difference_ms/ONE_DAY)
}

// Calculate amount of MONTHS between two dates
function monthsBetween(date1, date2) {
	var months = (date2.getMonth() - date1.getMonth())
		+ 1 
		+ (12 * (date2.getFullYear() - date1.getFullYear()));
	if (date2.getDate() < date1.getDate()) {
		months--;
	}
	return months;
}

// Calculate amount of DAYS in a MONTH
function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}

// Time Ago 
function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return '<b style="color:#AA0000;">' + Math.round(elapsed/msPerDay) + ' days ago</b>';   
    }

    else if (elapsed < msPerYear) {
        return '<b style="color:#AA0000;">' + Math.round(elapsed/msPerMonth) + ' months ago</b>';   
    }

    else {
        return '<b style="color:#AA0000;">' + Math.round(elapsed/msPerYear ) + ' years ago</b>';   
    }
}


// Format Number to look nice
function accFormat(amount){return amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').slice(0, -3)}

/**
 * Sorts an array with multiple ordering criteria.
 *
 * It applies the Schwartzian transform:
 * https://en.wikipedia.org/wiki/Schwartzian_transform
 *
 * You can fork this project on github:
 * https://github.com/jherax/array-sort-by.git
 *
 *	sortBy(selectStats, (o) => -o.amount); BIGGEST number first
 *	sortBy(selectStats, (o) => o.amount); SMALLEST number first
 *
 *	sortBy(selectStats, (o) => o.text); A-Z 
 *	sortBy(selectStats, (o) => "DESC:" + o.text); Z-A 
 *	sortBy(bookingArray, (o) => [o.property.toUpperCase(), o.checkin]);
 *
 *	sortBy(arr, (o) => 'DESC:' + o.name.toUpperCase());
 *	sortBy(arr, (o) => [o.name.toUpperCase(), -o.age, o.id]);
 *
 */
const sortBy = (function() {

  const _DESC = (/^desc:\s*/i);

  // Sests whether the input value is a string and has set the flag for descending order.
  const isDesc = (v) => typeof v === 'string' && _DESC.test(v);

  // Compares each element and defines the sort order.
  function comparer(prev, next) {
    let asc = 1;
    if (prev === next) return 0;
    if (isDesc(prev)) asc = -1;
    return (prev > next ? 1 : -1) * asc;
  }

  // Compares each decorated element.
  function sortItems(aprev, anext) {
    let sorted, i;
    for (i in aprev) { // eslint-disable-line
      sorted = comparer(aprev[i], anext[i]);
      if (sorted) return sorted;
    }
    return 0;
  }
  
  // Defines the default sort order (ASC)
  const defaultSort  = (p, n) => p < n ? -1 : +(p > n);

  /*
   * Sort an array and allows multiple sort criteria.
   *
   * @param  {Array} array: the collection to sort
   * @param  {Function} parser: transforms each item and specifies the sort order
   * @return {Array}
   */
  return function sortBy(array, parser) {
    let i, item;
    const arrLength = array.length;
    if (typeof parser === 'undefined') {
      return array.sort(defaultSort);
    }
    // Schwartzian transform (decorate-sort-undecorate)
    for (i = arrLength; i;) {
      item = array[i -= 1];
      // decorate the array
      array[i] = [].concat(parser.call(null, item, i), item);
      // console.log('decorated: ', array[i]);
    }
    // sort the array
    array.sort(sortItems);
    // undecorate the array
    for (i = arrLength; i;) {
      item = array[i -= 1];
      array[i] = item[item.length - 1];
    }
    return array;
  }
}());