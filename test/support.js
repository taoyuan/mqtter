var mqtt = require("mqtt");

var _port = 6890;

exports.nextPort = function () {
  return _port++;
};

function buildAndConnect(done, instance, callback) {
  var client = mqtt.connect({port: instance.opts.port});

  client.once("error", done);
  client.once("close", function () {
    done();
  });

  client.on("connect", function () {
    callback(client);
  });
}

exports.buildAndConnect = buildAndConnect;
