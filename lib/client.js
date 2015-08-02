'use strict';

var MoscaClient = require('mosca/lib/client');

// client --[SUB]--> backend
MoscaClient.prototype._doHandleAuthorizeSubscribe = MoscaClient.prototype.handleAuthorizeSubscribe;
MoscaClient.prototype.handleAuthorizeSubscribe = function (err, success, packet, cb) {
  if (err || !success) return this._doHandleAuthorizeSubscribe(err, success, packet, cb);
  var that = this;
  this.server.beforeSubscribe(this, packet, function (err) {
    if (err) return cb && cb(err);
    that._doHandleAuthorizeSubscribe(err, success, packet, cb);
  });
};


// client --[PUB]--> backend
MoscaClient.prototype._doHandleAuthorizePublish = MoscaClient.prototype.handleAuthorizePublish;
MoscaClient.prototype.handleAuthorizePublish = function (err, success, packet) {
  if (err || !success) this._doHandleAuthorizePublish(err, success, packet);
  var that = this;
  this.server.beforePublish(this, packet, function (err) {
    if (err) throw err;
    that._doHandleAuthorizePublish(err, success, packet);
  });
};


// client --[UN-SUB]--> backend
MoscaClient.prototype._doUnsubscribeMapTo = MoscaClient.prototype.unsubscribeMapTo;
MoscaClient.prototype.unsubscribeMapTo = function (topic) {
  var that = this;
  var answer = null;
  var packet = {topic: topic};
  this.server.beforeUnsubscribe(this, packet, function (err) {
    if (err) throw err;
    answer = that._doUnsubscribeMapTo(packet.topic);
  });
  if (!answer) throw new Error('unsubscribe before interceptor is not sync returned the unsubscribe handler');
  return answer;
};

