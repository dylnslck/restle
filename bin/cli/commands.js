var fs = require('fs');
var path = require('path');
var format = require('string-template');

var templatesRoot = path.resolve('bin/templates/');
var modelTemplate = fs.readFileSync(templatesRoot + '/model', 'utf-8');
var schemaTemplate = fs.readFileSync(templatesRoot + '/schema', 'utf-8');
var eventTemplate = fs.readFileSync(templatesRoot + '/event', 'utf-8');

exports.init = function (args) {
  var appFolder;

  if (args) {
    appFolder = args[0];
  } else {
    appFolder = path.resolve('app/');
  }

  // Create app location.
  fs.mkdirSync(appFolder, 0755);

  // Create restle.json.
  fs.open(appFolder + '/restle.json', 'w', function (err, fd) {
    if(err) throw err;

    fs.writeSync(fd, 'hello world', 'utf-8');
  });
};

exports.g = function (args) {
  console.log('generating with these args:');
  console.log(args);
};

exports.generate = exports.g;
