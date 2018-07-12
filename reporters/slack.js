
var Reporter = function () {
  this.config = (Alloy.CFG.jafar && Alloy.CFG.jafar.slack) ? Alloy.CFG.jafar.slack : {};

  this.messageQueue = [];
};

var TAG = 'JAFAR-Slack:';
var EMOJIS = {
  'start': '📱',
  'info': '🌀',
  'warn': '❗️',
  'success': '🎉',
  'error': '💥',
  'passed': '⭕️',
  'failed': '❌',
  'incomplete': '❓',
}

function sendMessage(webhook, text) {
  var client = Ti.Network.createHTTPClient({
    onerror: function(err) {
      Ti.API.error(TAG, err);
    }
  });

  client.open("POST", webhook);
  client.setRequestHeader('Content-type', 'application/json');
  client.send(JSON.stringify({
    text: text,
  }));
}

Reporter.prototype._pushMessage = function (type, msg) {
  this.messageQueue = this.messageQueue || [];
  this.messageQueue.push((EMOJIS[type] || EMOJIS.info) + ' ' + msg);
};

Reporter.prototype._report = function() {
  this.messageQueue = this.messageQueue || [];
  sendMessage(this.config.webhook, this.messageQueue.join('\n'));

  this.messageQueue = [];
};

Reporter.prototype.jasmineStarted = function (suiteInfo) {
  var message = "Running tests for *" + Ti.App.name + "* with " + suiteInfo.totalSpecsDefined + " specs";
  message += suiteInfo.order.random ? " in random order." : ".";

  this._pushMessage("start", message);
  this._report();
};

Reporter.prototype.specDone = function (result) {
  var message = "The spec \"" + result.description + "\" was " + result.status + ".";
  var successes = result.passedExpectations || [];
  var fails = result.failedExpectations || [];

  fails.forEach(function(fail) {
    message += "\n>" + fail.message.split('\n').join('\n>');
  });

  message += '\n';
  message += EMOJIS.passed + " Passed: " + successes.length + " | " + EMOJIS.failed + " Failed: " + fails.length;

  this._pushMessage(fails.length ? 'error' : 'success', message);
};

Reporter.prototype.suiteDone = function (result) {
  var status = String(result.status);
  var message = "The suite \"" + result.description + "\" was " + status + ".";

  this._pushMessage(status, message);
};

Reporter.prototype.jasmineDone = function (result) {
  var status = String(result.overallStatus);
  var message = "Tests finished! They were " + status + ".";

  this._pushMessage(status, message);
  this._report();
};

module.exports = Reporter;
