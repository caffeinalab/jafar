var config = Alloy.CFG.jafar || {};

var SPEC_DIR = 'tester/spec/';
var REPORTERS_DIR = 'tester/reporters/';
var jasmineRequire = require('tester/jasmine');
var jasmine = jasmineRequire.core(jasmineRequire);
var env = jasmine.getEnv();

var jasmineInterface = jasmineRequire.interface(jasmine, env);
extend(exports, jasmineInterface)

_.each(config.reporters, function(name) {
  try {
    var Reporter = require(REPORTERS_DIR + name);
    env.addReporter(new Reporter());
  } catch(err) {
    Ti.API.error('Error while adding the reporter "' + name + '":', err);
  }
});

function extend(destination, source) {
  for (var property in source) destination[property] = source[property];
  return destination;
}

// Taken and modified from Trimethyl
function getSpecDirectory() {
  var base = '';

	if (OS_IOS) {
		if (Ti.Shadow) {
			base = Ti.Filesystem.applicationDataDirectory + Ti.App.name + '/iphone/';
		} else {
			base = Ti.Filesystem.resourcesDirectory;
		}
	} else {
		base = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "").nativePath + (Ti.Shadow ? "/" : "");
  }

  return base + SPEC_DIR;
};

exports.addSpecs = function() {
  var dir = Ti.Filesystem.getFile(getSpecDirectory());
  if (!dir.isDirectory()) {
		throw new Error('You have to create a "spec" directory inside the "tester" library.');
  }

  dir.getDirectoryListing().forEach(function(item) {
    // TODO improve the regex
    if (!item.match(/.*_spec.js$/)) return;

    // TODO improve path building
    require(SPEC_DIR + item.replace('.js',''));
  });
};

exports.run = function () {
  exports.jasmine.getEnv().execute();
};
