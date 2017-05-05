'use strict';

require('./client'); // patch the client

const Server = require('mosca').Server;
const Router = require('middist');

module.exports = Server;

Server.prototype.lazyrouter = function () {
  if (!this._router) {
    this._router = new Router();
  }
};

Server.prototype.use = function (path, fns) {
  this.lazyrouter();
  this._router.use.apply(this._router, arguments);
  return this;
};

Server.prototype._handle = function (path, context, cb) {
  this.lazyrouter();
  context = context || {};
  context.server = this;
  this._router.handle(path, context, function (err, context) {
    if (err) return cb(err);
    cb(null, context.result);
  });
};

/**
 * The function that will be used to authenticate users.
 * This default implementation authenticate everybody.
 * Override at will.
 *
 * @api public
 * @param {Object} client The MQTTConnection that is a client
 * @param {String} username The username
 * @param {String} password The password
 * @param {Function} callback The callback to return the verdict
 */
Server.prototype.authenticate = function(client, username, password, callback) {
  this._handle('authenticate', {
    client: client,
    username: username,
    password: password
  }, function (err, success) {
    success = !err && success !== false;
    callback(err, success);
  });
};

/**
 * The function that will be used to authorize clients to publish to topics.
 * This default implementation authorize everybody.
 * Override at will
 *
 * @api public
 * @param {Object} client The MQTTConnection that is a client
 * @param {String} topic The topic
 * @param {String} payload The payload
 * @param {Function} callback The callback to return the verdict
 */
Server.prototype.authorizePublish = function (client, topic, payload, callback) {
  this._handle('publish:authorize', {
    client: client,
    topic: topic,
    payload: payload
  }, function (err, success) {
    success = !err && success !== false;
    callback(err, success);
  });
};

/**
 * The function that will be used to authorize clients to subscribe to topics.
 * This default implementation authorize everybody.
 * Override at will
 *
 * @api public
 * @param {Object} client The MQTTConnection that is a client
 * @param {String} topic The topic
 * @param {Function} callback The callback to return the verdict
 */
Server.prototype.authorizeSubscribe = function (client, topic, callback) {
  this._handle('subscribe:authorize', {
    client: client,
    topic: topic
  }, function (err, success) {
    success = !err && success !== false;
    callback(err, success);
  });
};

/**
 * The function that will be used to authorize forwarding packet to client.
 * This default implementation authorize any packet for any client.
 * Override at will
 *
 * @api public
 * @param {Object} client The MQTTConnection that is a client.
 * @param {Object} packet The packet to be published.
 * @param {Function} callback The callback to return the authorization flag.
 */
Server.prototype.authorizeForward = function (client, packet, callback) {
  const that = this;
  this._handle('forward:authorize', {
    client: client,
    packet: packet
  }, function handle(err, success) {
    success = !err && success !== false;
    if (err || !success) return callback(err, success);
    that.beforeForward(client, packet, function (err) {
      if (err) return callback(err);
      callback(null, success);
    });
  });
};

Server.prototype.beforeSubscribe = function (client, packet, cb) {
  this._handle('subscribe:before', {
    client: client,
    packet: packet
  }, cb);
};

Server.prototype.beforePublish = function (client, packet, cb) {
  this._handle('publish:before', {
    client: client,
    packet: packet
  }, cb);
};

Server.prototype.beforeForward = function (client, packet, cb) {
  this._handle('forward:before', {
    client: client,
    packet: packet
  }, cb);
};

Server.prototype.beforeUnsubscribe = function (client, packet, cb) {
  this._handle('unsubscribe:before', {
    client: client,
    packet: packet
  }, cb);
};
