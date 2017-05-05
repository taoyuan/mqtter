'use strict';

const Client = require('mosca/lib/client');

// client --[SUB]--> backend
Client.prototype._doHandleAuthorizeSubscribe = Client.prototype.handleAuthorizeSubscribe;
Client.prototype.handleAuthorizeSubscribe = function (err, success, packet, cb) {
  if (err || !success) return this._doHandleAuthorizeSubscribe(err, success, packet, cb);
  const that = this;
  this.server.beforeSubscribe(this, packet, function (err) {
    if (err) return cb && cb(err);
    that._doHandleAuthorizeSubscribe(err, success, packet, cb);
  });
};


// client --[PUB]--> backend
Client.prototype._doHandleAuthorizePublish = Client.prototype.handleAuthorizePublish;
Client.prototype.handleAuthorizePublish = function (err, success, packet) {
  if (err || !success) this._doHandleAuthorizePublish(err, success, packet);
  const that = this;
  this.server.beforePublish(this, packet, function (err) {
    if (err) throw err;
    that._doHandleAuthorizePublish(err, success, packet);
  });
};


// client --[UN-SUB]--> backend
Client.prototype._doUnsubscribeMapTo = Client.prototype.unsubscribeMapTo;
Client.prototype.unsubscribeMapTo = function (topic, cb) {
  const that = this;
  const packet = {topic: topic};
  this.server.beforeUnsubscribe(this, packet, function (err) {
    if (err) throw err;
    that._doUnsubscribeMapTo(packet.topic, cb);
  });
};

