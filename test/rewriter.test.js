const t = require('chai').assert;
const pd = require('plando');
const Rewriter = require('../lib/rewriter');

describe('topic-rewriter', function () {

  it('should rewrite topic correctly for both in and out bound', function (done) {
    const d = pd(2, done);
    const rewriter = new Rewriter([
      {type: 'in', from: '\$(.*)', to: '\$foo/$1'},
      {type: 'out', from: '\$foo/(.*)', to: '\$$1'}
    ]);

    const in_rewrite = rewriter.rewrite('in');
    const out_rewrite = rewriter.rewrite('out');

    const in_packet = {topic: '$bar/123'};
    const out_packet = {topic: '$foo/bar/123'};

    const in_context = {packet: in_packet};
    in_rewrite(in_context, function () {
      t.equal(in_context.packet.topic, '$foo/bar/123');
      d();
    });

    const out_context = {packet: out_packet};
    out_rewrite(out_context, function (err, ctx) {
      t.equal(out_context.packet.topic, '$bar/123');
      d();
    });
  });
});
