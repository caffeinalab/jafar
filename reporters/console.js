var Reporter = function (opts) {
  this.tag = 'JASMINE:';
};

Reporter.prototype._report = function (level, msg) {
  Ti.API[level](this.tag, msg);
}

Reporter.prototype.jasmineStarted = function (suiteInfo) {
  this._report("warn", "Running suite with " + suiteInfo.totalSpecsDefined);
};

Reporter.prototype.suiteStarted = function (result) {
  this._report(
    "warn",
    "Suite started: " + result.description + " (" + result.fullName + ")"
  );
};

Reporter.prototype.specStarted = function (result) {
  this._report(
    "warn",
    "Spec started: " + result.description + " (" + result.fullName + ")"
  );
};

Reporter.prototype.specDone = function (result) {
  this._report(
    "warn",
    "Spec: " + result.description + " was " + result.status
  );

  for (var i = 0; i < result.failedExpectations.length; i++) {
    this._report("error", "Failure: " + result.failedExpectations[i].message);
    this._report("error", result.failedExpectations[i].stack);
  }
  this._report("warn", result.passedExpectations.length);
};

Reporter.prototype.suiteDone = function (result) {
  this._report(
    "warn",
    "Suite: " + result.description + " was " + result.status
  );

  for (var i = 0; i < result.failedExpectations.length; i++) {
    this._report('error', 'Suite ' + result.failedExpectations[i].message);
    this._report('error', result.failedExpectations[i].stack);
  }
};

Reporter.prototype.jasmineDone = function (result) {
  this._report("warn", 'Finished suite: ' + result.overallStatus);
  for (var i = 0; i < result.failedExpectations.length; i++) {
    this._report('error', 'Global ' + result.failedExpectations[i].message);
    this._report('error', result.failedExpectations[i].stack);
  }
};

module.exports = Reporter;
