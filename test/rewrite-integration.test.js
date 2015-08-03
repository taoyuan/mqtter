'use strict';

var async = require('async');
var t = require('chai').assert;
var pd = require('plando');
var mqttoxy = require('../');
var TopicRewriter = mqttoxy.TopicRewriter;
var Server = mqttoxy.Server;
var s = require('./support');

var rewriter = new TopicRewriter([
  {type: 'in', from: '\$*', to: '\$foo/$1'},
  {type: 'out', from: '\$foo/*', to: '\$$1'}
]);

var in_topic = '$bar/123';
var out_topic = '$foo/bar/123';

var moscaSettings = function() {
  return {
    port: s.nextPort(),
    stats: false,
    publishNewClient: false,
    publishClientDisconnect: false
  };
};

describe('rewrite/integration', function () {

  beforeEach(function () {
    this.server = new Server(moscaSettings());
  });

  afterEach(function (done) {
    var that = this;
    setImmediate(function () {
      that.server.close(done);
    });
  });

  it('should rewrite subscribe topic', function (done) {
    var d = pd(2, done);

    var server = this.server;
    // rewrite inbound subscription
    server.use('subscribe:before', rewriter.rewrite('in'));

    server.on("subscribed", function (topic) {
      t.equal(topic, out_topic);
      d();
    });

    s.buildAndConnect(d, server, function (client) {
      client.subscribe(in_topic, function (err) {
        if (err) return done(err);
        client.end();
      });
    });
  });

  it('should rewrite unsubscribe topic', function (done) {
    var d = pd(2, done);

    var server = this.server;
    // rewrite inbound unsubscription
    server.use('unsubscribe:before', rewriter.rewrite('in'));

    server.on("unsubscribed", function (topic) {
      t.equal(topic, out_topic);
      d();
    });

    s.buildAndConnect(d, server, function (client) {
      client.unsubscribe(in_topic, function (err) {
        if (err) return done(err);
        client.end();
      });
    });
  });

  it('should rewrite publish topic', function (done) {
    var d = pd(2, done);

    var server = this.server;
    // rewrite inbound publish
    server.use('publish:before', rewriter.rewrite('in'));

    server.on("published", function (packet) {
      t.equal(packet.topic, out_topic);
      d();
    });

    s.buildAndConnect(d, server, function (client) {
      client.publish(in_topic, '', function (err) {
        if (err) return done(err);
        client.end();
      });
    });
  });

  it('should rewrite forward topic', function (done) {
    var d = pd(4, done);

    var server = this.server;
    // rewrite inbound publish
    server.use('subscribe:before', rewriter.rewrite('in'));
    server.use('publish:before', rewriter.rewrite('in'));
    server.use('forward:before', rewriter.rewrite('out'));

    server.on("subscribed", function (topic) {
      if (topic.indexOf('$SYS') >= 0) return;
      t.equal(topic, out_topic);
      d();
    });

    server.on("published", function (packet) {
      if (packet.topic.indexOf('$SYS') >= 0) return;
      t.equal(packet.topic, out_topic);
      d();
    });

    async.series([
      function (callback) {
        s.buildAndConnect(d, server, function (client) {
          client.on('message', function (topic, payload) {
            t.equal(topic, in_topic);
            t.equal(payload, 'hello');
            client.end();
          });
          client.subscribe(in_topic, function (err) {
            if (err) return callback(err);
            callback();
          });
        });
      },
      function (callback) {
        s.buildAndConnect(d, server, function (client) {
          client.publish(in_topic, 'hello', function (err) {
            if (err) return callback(err);
            client.end();
            callback();
          });
        });
      }
    ], function (err) {
      if (err) return done();
    });
  });
});
