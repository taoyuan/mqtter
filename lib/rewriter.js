const assert = require('assert');
const PathRewriter = require('path-rewriter');
const _ = require('lodash');

module.exports = Rewriter;

function Rewriter(rules) {
  assert(rules, '`rules` is required');
  if (!(this instanceof Rewriter)) return new Rewriter(rules);
  const rewriter = this._rewriter = new PathRewriter();

  _.forEach(rules, function (rule) {
    rewriter.rule(rule);
  });
}

Rewriter.prototype.rewrite = function (type) {
  const rewriter = this._rewriter;
  return function (ctx, cb) { // middist middleware
    ctx.packet.topic = rewriter.rewrite(type, ctx.packet.topic);
    cb();
  };
};
