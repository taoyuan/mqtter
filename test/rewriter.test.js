'use strict';

var t = require('chai').assert;
var pd = require('plando');
var Rewriter = require('../lib/rewriter');

describe('topic-rewriter', function () {

  it('should rewrite topic correctly for both in and out bound', function (done) {
    var d = pd(2, done);
    var rewriter = new Rewriter([
      {type: 'in', from: '\$*', to: '\$foo/$1'},
      {type: 'out', from: '\$foo/*', to: '\$$1'}
    ]);

    var in_rewrite = rewriter.rewrite('in');
    var out_rewrite = rewriter.rewrite('out');

    var in_packet = {topic: '$bar/123'};
    var out_packet = {topic: '$foo/bar/123'};

    var in_context = {packet: in_packet};
    in_rewrite(in_context, function () {
      t.equal(in_context.packet.topic, '$foo/bar/123');
      d();
    });

    var out_context = {packet: out_packet};
    out_rewrite(out_context, function (err, ctx) {
      t.equal(out_context.packet.topic, '$bar/123');
      d();
    });
  });
});
