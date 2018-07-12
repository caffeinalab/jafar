// Get the same config as T/http
exports.config = _.extend({
	base: '',
}, Alloy.CFG.T ? Alloy.CFG.T.http : {});

var Q = require('T/ext/q');

function getResourcesDirectory() {
	if (OS_IOS) {
		if (Ti.Shadow) {
			return Ti.Filesystem.applicationDataDirectory + Ti.App.name + '/iphone/';
		} else {
			return Ti.Filesystem.resourcesDirectory;
		}
	} else {
		return Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "").nativePath + (Ti.Shadow ? "/" : "");
	}
}

function getResource(file) {
  if (file.exists() == false) {
    throw Error('File ' + file.nativePath + ' does not exist.');
  }

  if (file.isFile() == false) {
    throw Error('' + file.nativePath + ' is not a file.')
  }

  var data = file.read().toString();

  try {
    data = JSON.parse(data);
  } catch(err) {}

  return data;
}

function getMockDataForRequest(opt) {
  // Transform the url to a file path, following the same structure as the resource requested.
  // If the requested resource is a directory, return the "index" file in that directory
  var path = opt.url.replace(exports.config.base, '');

  var file = Ti.Filesystem.getFile(getResourcesDirectory() + 'tester/mock/' + path);

  if (file.isDirectory()) {
    // Descend and get the "index" file
    file = Ti.Filesystem.getFile(getResourcesDirectory() + 'tester/mock/' + path + '/index');
  }

  return getResource(file);
}

/**
 * Mock of the HTTPRequest class from T/HTTP
 * @param {Object} opt
 */
function MockHTTPRequest(opt) {
  this.opt = opt || {};

  var self = this;

  this.defer = Q.defer();
	this.defer.promise.then(function() {
    if (typeof self.opt.success == 'function') {
      self.opt.success.apply(self, arguments);
    }
  });
	this.defer.promise.catch(function() {
    if (typeof self.opt.error == 'function') {
      self.opt.error.apply(self, arguments);
    }
  });
	this.defer.promise.finally(function() {
    if (typeof self.opt.complete == 'function') {
      self.opt.complete.apply(self, arguments);
    }
  });
};

MockHTTPRequest.prototype.send = function() {
  var success = true;
  var data = {};

  try {
    data = getMockDataForRequest(this.opt);
  } catch(err) {
    success = false;
    data = {
      message: err,
      error: err,
      code: 404,
      response: null,
    };
  }

  if (success) {
    this.defer.resolve(data);
  } else {
    this.defer.reject(data);
  }
};

MockHTTPRequest.prototype.resolve = function() {
  this.send();
};

MockHTTPRequest.prototype.success = MockHTTPRequest.prototype.then = function(func) {
	this.opt.success = func;
	return this;
};

MockHTTPRequest.prototype.error = MockHTTPRequest.prototype.fail = MockHTTPRequest.prototype.catch = function(func) {
	this.opt.error = func;
	return this;
};

MockHTTPRequest.prototype.complete = MockHTTPRequest.prototype.fin = MockHTTPRequest.prototype.finally = function(func) {
	this.opt.complete = func;
	return this;
};

/**
 * Mocked HTTP.send method
 * @param {Object} opt The request dictionary
 * @param {String} opt.url The endpoint URL
 * @param {String} [opt.method="GET"] The HTTP method to use (GET|POST|PUT|PATCH|..)
 * @param {Function} [opt.success] The success callback
 * @param {Function} [opt.error] The error callback
 * @return {HTTP.Request}
 */
function send(opt) {
  var request = new MockHTTPRequest(opt);
  request.resolve();
	return request;
};
exports.send = send;

/**
 * Mocked HTTP.get method
 * @param  {String}   	url The endpoint url
 * @param  {Function} 	success  Success callback
 * @param  {Function} 	error Error callback
 * @return {HTTP.Request}
 */
exports.get = function(url, success, error) {
  return send({
    url: url,
    method: "GET",
    success: success,
    error: error
  });
};

/**
 * Mocked HTTP.post method
 * @param  {String}   	url 		The endpoint url
 * @param  {Object}   	data 		The data
 * @param  {Function} 	success  Success callback
 * @param  {Function} 	error 	Error callback
 * @return {HTTP.Request}
 */
exports.post = function(url, data, success, error) {
  return send({
    url: url,
    method: "POST",
    data: data,
    success: success,
    error: error
  });
};
