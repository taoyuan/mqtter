'use strict';

var assert = require('assert');
var PathRewriter = require('path-rewriter');
var _ = require('lodash');

module.exports = TopicRewriter;

function TopicRewriter(rules) {
  assert(rules, '`rules` is required');
  var rewriter = this.rewriter = new PathRewriter();

  _.forEach(rules, function (rule) {
    rewriter.rule(rule);
  });
}

TopicRewriter.prototype.rewrite = function (type) {
  var rewriter = this.rewriter;
  return function (ctx, cb) { // middist middleware
    ctx.packet.topic = rewriter.rewrite(type, ctx.packet.topic);
    cb();
  };
};
