
// Standard libs
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

// Unknown libs
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cron = require('node-cron');
var request = require('request');

// Custom libs
var Beds24 = require('./controllers/Beds24Controller');

// Unknown routes
var routes = require('./routes/index');
var users = require('./routes/users');
var todos = require('./routes/todos');
var checkList = require('./routes/checkList');
var emailVariable = require('./routes/emailVariable');
var invoice = require('./routes/invoice');
var currency = require('./routes/currency');
var CurrencyDataController = require('./controllers/CurrencyDataController');
var booking = require('./routes/booking');
var news = require('./routes/news');


// Global Routes - we use everywhere
var priceRoute = require('./routes/priceRoute');
var omise = require('./routes/omise');


// ThaiHome Website Routes
var frontpageRoute = require('./routes/frontpageRoute'); 
var searchRoute = require('./routes/searchRoute'); 

// Manager Routes


// Admin Routes


// Report Routes
var agentSaleRoute = require('./routes/agentSaleRoute');
var priceRoute = require('./routes/priceRoute');
var expenseCategoryRoute = require('./routes/expenseCategoryRoute');
var expenseRoute = require('./routes/expenseRoute');
var propertyIdListRoute = require('./routes/propertyIdListRoute');
var agentSaleRoute = require('./routes/agentSaleRoute');
var agentRentRoute = require('./routes/agentRentRoute');
var bankAccountRoute = require('./routes/bankAccountRoute');
var bankRoute = require('./routes/bankRoute');
var balanceSheetRoute = require('./routes/balanceSheetRoute');
var bookingListRoute = require('./routes/bookingListRoute');
var occupancyRoute = require('./routes/occupancyRoute');
var profitRoute = require('./routes/profitRoute');
var natChanRoute = require('./routes/natChanRoute');
var statusRoute = require('./routes/statusRoute');
var doubleBookingRoute = require('./routes/doubleBookingRoute');
var messageRoute = require('./routes/messageRoute');
var bookingCheckinRoute = require('./routes/bookingCheckinRoute');

// For Torbens Testing
var testRoute = require('./routes/testRoute');
var dataRoute = require('./routes/dataRoute');


// Just add bluebird to your package.json, and then the following line should work
// mongoose.Promise = require('bluebird');

var app = express();

// Runs the scheduled Get currency rates job every 1 hour
cron.schedule('0 1 * * *', function () {
//  CurrencyDataController.getRates();
});

// Runs the scheduled Beds24 jobs every second
cron.schedule('* * * * *', function () {
  // Beds24.getProperty();
  // Beds24.getBookings();
});

// Connect to mongodb
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

// Set debug = on so we can see what its doing
mongoose.set('debug', true);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Used for login cookies
app.use(cookieParser());

// Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Allow parsing data with external services
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, token');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});


// Global Routes
app.use('/', routes);
app.use('/price', priceRoute);

// ThaiHome Website Routes
app.use('/users', users);
app.use('/todos', todos);
app.use('/checkList', checkList);
app.use('/emailVariable', emailVariable);
app.use('/invoice', invoice);
app.use('/currency', currency);
app.use('/booking', booking);
app.use('/omise', omise);
app.use('/news', news);
app.use('/frontpageRoute', frontpageRoute);
app.use('/searchRoute', searchRoute);

// Report Routes
app.use('/report', agentSaleRoute);
app.use('/report', priceRoute);
app.use('/report', expenseCategoryRoute);
app.use('/report', expenseRoute);
app.use('/report', propertyIdListRoute);
app.use('/report', agentSaleRoute);
app.use('/report', agentRentRoute);
app.use('/report', bankAccountRoute);
app.use('/report', bankRoute);
app.use('/report', balanceSheetRoute);
app.use('/report', bookingListRoute);
app.use('/report', occupancyRoute);
app.use('/report', profitRoute);
app.use('/report', natChanRoute);
app.use('/report', statusRoute);
app.use('/report', doubleBookingRoute);
app.use('/report', messageRoute);
app.use('/report', bookingCheckinRoute);

// For Torbens Testing
app.use('/testRoute', testRoute);
app.use('/dataRoute', dataRoute);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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

// Helper port
app.set('port', process.env.PORT || 3001);

// Setup server to listen
var server = app.listen(app.get('port'), function () {
  console.log("Server running at "+ server.address().port);
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