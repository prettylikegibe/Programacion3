var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./src/services/auth');
var productoRouter = require('./src/routes/productoRoutes');
var cartRouter = require('./src/routes/cartRoutes');
var ensureAdmin = require('./middleware/ensureAdmin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));
app.use(express.static(path.join(__dirname, 'public')));

// expose cart count and user/admin to views
app.use(function (req, res, next) {
  let count = 0;
  if (req.session && req.session.cart && Array.isArray(req.session.cart.items)) {
    count = req.session.cart.items.reduce((s, it) => s + (parseInt(it.cantidad || 0, 10) || 0), 0);
  }
  res.locals.cartCount = count;
  res.locals.user = req.session && req.session.user;
  res.locals.admin = req.session && req.session.admin;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', authRouter);
app.use('/productos', productoRouter);
app.use('/admin/productos', ensureAdmin, productoRouter);
app.use('/carrito', cartRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { message: res.locals.message, error: res.locals.error });
});

module.exports = app;
