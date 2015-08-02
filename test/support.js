'use strict';

var Connection = require("mqtt-connection");
var net = require("net");

function buildOpts() {
  return {
    keepalive: 1000,
    clientId: 'mosca_' + require("crypto").randomBytes(8).toString('hex'),
    protocolId: 'MQIsdp',
    protocolVersion: 3
  };
};

function createConnection(port) {
  var stream = net.createConnection(port);
  var conn = new Connection(stream);
  stream.on('connect', function() {
    conn.emit('connected');
  });
  return conn;
}
exports.createConnection = createConnection;

function buildClient(instance, done, callback) {
  var client = createConnection(instance.opts.port);

  client.once("error", done);
  client.stream.once("close", function() {
    done();
  });

  client.on("connected", function() {
    callback(client);
  });
}
exports.buildClient = buildClient;

function buildAndConnect(done, instance, opts, callback) {

  if (typeof opts === "function") {
    callback = opts;
    opts = buildOpts();
  }

  buildClient(instance, done, function(client) {
    client.opts = opts;

    client.connect(opts);

    client.on("connack", function(packet) {
      callback(client);
    });
  });
}

exports.buildAndConnect = buildAndConnect;
