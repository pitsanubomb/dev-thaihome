var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cron = require('node-cron');
var request = require('request');
var Beds24 = require('./controllers/Beds24Controller');


// Set the routes
var priceRoute = require('./routes/priceRoute');
var routes = require('./routes/index');
var users = require('./routes/users');
var todos = require('./routes/todos');
var checkList = require('./routes/checkList');
var emailVariable = require('./routes/emailVariable');
var invoice = require('./routes/invoice');
var currency = require('./routes/currency');
var CurrencyDataController = require('./controllers/CurrencyDataController');
var booking = require('./routes/booking');
var omise = require('./routes/omise');
var news = require('./routes/news');

// Just add bluebird to your package.json, and then the following line should work
mongoose.Promise = require('bluebird');

var app = express();

cron.schedule('0 1 * * *', function () {
  CurrencyDataController.getRates();
});

cron.schedule('* * * * *', function () {
  Beds24.getProperty();
  Beds24.getBookings();
});



global.db = "mongodb://thaihome:rootlocal@10.5.50.16:27017/thaihome";



mongoose.connect(global.db);

// Can we connect to mongodb
mongoose.connection.on('connected', () => {
  console.log("*** MongoDB is connected " + global.db);
});

// No we cannot, show error
mongoose.connection.on('error', (err) => {
  console.log("*** MongoDB cannot connect :" + err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, token');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

// Setup the routes
app.use('/price', priceRoute);
app.use('/', routes);
app.use('/users', users);
app.use('/todos', todos);
app.use('/checkList', checkList);
app.use('/emailVariable', emailVariable);
app.use('/invoice', invoice);
app.use('/currency', currency);
app.use('/booking', booking);
app.use('/omise', omise);
app.use('/news', news);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.set('port', process.env.PORT || 3001);

var server = app.listen(app.get('port'), function () {
  // util.log('Ready on port ' + server.address().port);
  console.log("Now server is run "+ server.address().port);
})

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;