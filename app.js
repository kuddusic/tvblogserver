var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var winston = require('./config/winston');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var stbloggerRouter = require('./routes/stbloggerRoute');
var batchloggerRouter = require('./routes/batchloggerRoute');
var sendEventsRouter = require('./routes/sendEventsRoute');
var ratingRouter = require('./routes/ratingRoute');

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(morgan('combined',{ stream: winston.stream }));

// to write correct remote ip address
morgan.token('remote-addr', function (req, res) {
  var ffHeaderValue = req.headers['x-forwarded-for'];
  return ffHeaderValue || req.connection.remoteAddress;
});

app.disable('x-powered-by'); // remove X-Powered-By headers.
//app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/stb-bootlogger',stbloggerRouter);
app.use('/bl',batchloggerRouter);
app.use('/el',sendEventsRouter);
app.use('/rr',ratingRouter);

// My 404 handler
app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    //res.render('404', { url: req.url });
    res.type('txt').send('<h1>404 Not found</h1>');
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// TODO: for production, disable jade and 404 handler.
// catch 404 and forward to error handler
/*
app.use(function(req, res, next) {
  next(createError(404));
});
*/

// error handler
/*
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/
module.exports = app;
