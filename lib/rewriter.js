'use strict';

var assert = require('assert');
var PathRewriter = require('path-rewriter');
var _ = require('lodash');

module.exports = Rewriter;

function Rewriter(rules) {
  assert(rules, '`rules` is required');
  if (!(this instanceof Rewriter)) return new Rewriter(rules);
  var rewriter = this._rewriter = new PathRewriter();

  _.forEach(rules, function (rule) {
    rewriter.rule(rule);
  });
}

Rewriter.prototype.rewrite = function (type) {
  var rewriter = this._rewriter;
  return function (ctx, cb) { // middist middleware
    ctx.packet.topic = rewriter.rewrite(type, ctx.packet.topic);
    cb();
  };
};
