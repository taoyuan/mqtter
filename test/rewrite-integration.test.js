'use strict';

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

describe('rewrite-integration', function () {

  it('should rewrite subscribe topic', function (done) {
    var d = pd(2, done);

    var server = new Server({});
    // rewrite inbound subscription
    server.use('subscribe:before', rewriter.rewrite('in'));

    server.ascoltatore._subscribe = server.ascoltatore.subscribe;
    server.ascoltatore.subscribe = function (topic) {
      if (topic.indexOf('$SYS') < 0) {
        t.equal(topic, out_topic);
        d();
      }
      server.ascoltatore._subscribe.apply(server.ascoltatore, arguments);
    };

    s.buildAndConnect(d, server, function (client) {
      var messageId = Math.floor(65535 * Math.random());

      client.on("suback", function() {
        client.disconnect();
      });

      client.subscribe({
        subscriptions: [{topic: in_topic, qos: 1}],
        messageId: messageId
      });
    });
  });
});
