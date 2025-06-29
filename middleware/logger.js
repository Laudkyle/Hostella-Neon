const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');

// Create log directory if it doesn't exist
const logDirectory = path.join(__dirname, '../logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Create a rotating write stream for access logs
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
});

// Development logging
exports.devLogger = morgan('dev');

// Production logging
exports.prodLogger = morgan('combined', {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode < 400
});