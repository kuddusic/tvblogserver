var appRoot = require('app-root-path');
var fs = require('fs');
var os = require('os');
const { format, loggers, transports } = require('winston');
//var winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const myRotateFile = require('./myRotateFile');

const hostname = os.hostname();
const platform = os.platform();

var logpath = '/var/log/tivibulogs'

debugger;
if (platform=="win32") {
  logpath = appRoot + '\\logs';
}

console.log("LOG PATH: "+ logpath);
// define the custom settings for each transport (file, console)
var options = {
    file: {
      level: 'debug',
      filename: `${logpath}/access.log`,
      handleExceptions: true,
      json: false,
      //maxsize: 52428800, // 5MB
      //maxFiles: 5,
      colorize: false,    
      datePattern : 'YYYYMMDD',  
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
       )
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      )
    },
  };

var stbloggerTransport = new myRotateFile({
  name: 'stbloggerTransport',
  filename : path.join(`${logpath}`, 'stblogs','stblog.' + hostname),    
  datePattern : 'YYYYMMDD.HHmm',
  frequency : "15m",    
  json: false,
  colorize: false,
  format: format.combine( format.printf(info => `${info.message}`))
  });

stbloggerTransport.on('rotate', function(oldFilename, newFilename) {
  if (fs.existsSync(oldFilename)) {
    console.log("Renaming file " + oldFilename);    
    fs.rename(oldFilename, oldFilename + '00.log', function(err) {
      if ( err ) console.error('ERROR: ' + err);
    });
  }
});


var batchloggerTransport = new myRotateFile({
  name: 'batchloggerTransport',
  filename : path.join(`${logpath}`, 'batchlogs','batchlog.' + hostname),    
  datePattern : 'YYYYMMDD.HHmm',
  frequency : "15m",    
  json: false,
  colorize: false,
  format: format.combine(  format.printf(info => `${info.message}`) )
  });

batchloggerTransport.on('rotate', function(oldFilename, newFilename) {
  if (fs.existsSync(oldFilename)) {
        console.log("Renaming file " + oldFilename);
    fs.rename(oldFilename, oldFilename + '00.log', function(err) {
      if ( err ) console.error('ERROR: ' + err);
    });
  }
});
var sendEventsTransport = new myRotateFile({
  name: 'sendEventsTransport',
  filename : path.join(`${logpath}`, 'iapmonitorlogs','iap-monitor-ptrknb-' + hostname),    
  datePattern : 'YYYYMMDD.HHmm',
  frequency : "15m",    
  json: false,
  colorize: false,
  format: format.combine(  format.printf(info => `${info.message}`) )
  });

sendEventsTransport.on('rotate', function(oldFilename, newFilename) {
  if (fs.existsSync(oldFilename)) {
    console.log("Renaming file " + oldFilename);
    fs.rename(oldFilename, oldFilename + '00.log', function(err) {
      if ( err ) console.error('ERROR: ' + err);
    });
  }
});

var ratingTransport = new myRotateFile({
  name: 'ratingTransport',
  filename : path.join(`${logpath}`, 'ratinglogs','ratinglog.' + hostname),    
  datePattern : 'YYYYMMDD.HHmm',
  frequency : "15m",    
  json: false,
  colorize: false,
  format: format.combine(  format.printf(info => `${info.message}`) )
  });

ratingTransport.on('rotate', function(oldFilename, newFilename) {
  if (fs.existsSync(oldFilename)) {
    console.log("Renaming file " + oldFilename);
    fs.rename(oldFilename, oldFilename + '00.log', function(err) {
      if ( err ) console.error('ERROR: ' + err);
    });
  }
});

// instantiate a new Winston Logger with the settings defined above  
loggers.add('main',{
  transports: [
    new myRotateFile(options.file),
    //new transports.Console(options.console),             
  ],
  exitOnError: false, // do not exit on handled exceptions
});

var logger = loggers.get('main');
// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message.slice(0, -1));
  },
};

loggers.add('stblogger',{
  transports: [
    stbloggerTransport,                  
  ],
  exitOnError: false, // do not exit on handled exceptions
});

loggers.add('batchlogger',{
  transports: [
    batchloggerTransport,                  
  ],
  exitOnError: false, // do not exit on handled exceptions
});

loggers.add('sendeventslogger',{
  transports: [
    sendEventsTransport,                  
  ],
  exitOnError: false, // do not exit on handled exceptions
});

loggers.add('ratinglogger',{
  transports: [
    ratingTransport,                  
  ],
  exitOnError: false, // do not exit on handled exceptions
});
  
module.exports = logger;