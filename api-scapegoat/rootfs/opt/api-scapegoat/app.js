const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('winston')
const consoleTransport = new winston.transports.Console()
const logger = new winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [consoleTransport]
})

// required to read yaml files
const env = process.env.NODE_ENV || 'dev';
const fs = require('fs');
const yaml = require('js-yaml');

// required to create proxy
const { createProxyMiddleware } = require('http-proxy-middleware');

const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// function to create scapegoats
const createScapegoat = function (config) {
  logger.info('[API Scapegoat] Creating route "' + config.route + '" for target "' + config.target + '"');

  app.use(config.route, createProxyMiddleware({
    target: config.target,
    changeOrigin: true,
    onError(err, req, res) {
      const failoverResponse = config.failover.response;
      res.writeHead(failoverResponse.status_code, failoverResponse.headers);
      logger.error(err);
      res.end(failoverResponse.body);
    },
    logProvider() {
      return logger;
    }
  }));
}

// read and create scapegoats
const configDirectory = app.get('env') === 'development' ? path.join('./config/') : path.join('/config/');
logger.info('[API Scapegoat] Reading scapegoats from ' + configDirectory);
fs.readdirSync(configDirectory).forEach(file => {

  if (file.endsWith('.yaml') > -1) {
    logger.info('[API Scapegoat] Importing ' + file + '...');
    const config = yaml.safeLoad(fs.readFileSync(configDirectory + file, 'utf8'));
    logger.debug(config);
    createScapegoat(config);
  }
  else if (file.endsWith('.json') > -1) {
    logger.info('[API Scapegoat] Importing ' + file + '...');
    const config = fs.readFileSync(configDirectory + file, 'utf8');
    logger.debug(config);
    createScapegoat(config);
  }
  else {
    logger.warn('[API Scapegoat] Skipping ' + file + '...');
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
