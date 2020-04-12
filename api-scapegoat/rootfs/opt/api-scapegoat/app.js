const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('winston')

// setup logging
const log_level = (process.env.LOG_LEVEL === 'off' ? 'silent' : process.env.LOG_LEVEL) || 'debug';
const consoleTransport = new winston.transports.Console();
const logger = new winston.createLogger({
  level: log_level,
  silent: log_level === 'silent',
  format: winston.format.simple(),
  transports: [consoleTransport]
});
logger.debug('[API Scapegoat] Log level has ben set to "' + log_level + '"')

// required to read yaml files
const fs = require('fs');
const yaml = require('js-yaml');

// required to create proxy
const { createProxyMiddleware } = require('http-proxy-middleware');

const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// turn on morgan logger if log_level > info
logger.debug('logger level is '+logger.level);
if (logger.level === 'debug' || logger.level === 'info') {
  app.use(morgan('[API Scapegoat] :method :url :status :res[content-length] - :response-time ms'));
}
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
    changeOrigin: config.changeOrigin,
    router: config.router,
    pathRewrite: config.pathRewrite,
    proxyTimeout: config.proxyTimeout,
    timeout: config.timeout,
    secure: true,
    onError(err, req, res) {
      const failoverResponse = config.failover.response;
      const status = failoverResponse.status_code || 200;
      const headers = failoverResponse.headers;
      const body = failoverResponse.body;
      // content length will always be overridden
      headers['content-length'] = body.length;
      res.writeHead(status, headers);
      res.end(body);
    },
    logLevel: log_level,
    logProvider() {
      return logger;
    }
  }));
}

// read and create scapegoats
const configDirectory = app.get('env') === 'development' ? path.join('./config/') : path.join('/config/api-scapegoat/');
logger.info('[API Scapegoat] Reading scapegoats from ' + configDirectory);
fs.readdirSync(configDirectory).forEach(file => {

  if (file.endsWith('.yaml')) {
    logger.info('[API Scapegoat] Importing ' + file + '...');
    const config = yaml.safeLoad(fs.readFileSync(configDirectory + file, 'utf8'));
    logger.debug('[API Scapegoat] Config: ' + JSON.stringify(config));
    createScapegoat(config);
  }
  else if (file.endsWith('.json')) {
    logger.info('[API Scapegoat] Importing ' + file + '...');
    const config = JSON.parse(fs.readFileSync(configDirectory + file, 'utf8'));
    logger.debug('[API Scapegoat] Config: ' + JSON.stringify(config));
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
