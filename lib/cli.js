// External lib
var
nopt = require("nopt");

// Options we care about
exports.known = {enyo: String, source: String, output: String, sourcemap: String};
exports.aliases = {e: "--enyo", s: "--source", o: "--output", m: "--sourcemap"};

// Parse cli options and return as an object.
Object.defineProperty( exports, "options", {
  get: function() {
    return nopt( exports.known, exports.aliases, process.argv, 2 );
  }
});
