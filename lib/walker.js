// Credit where credit is due.
// Script taken from enyojs enyo/tools/minifier/node_modules directory.

var fs = require("fs");
var path = require('path');

//
// setup DOM-like sandbox
//

var window = {};
var loader;

var script = function(inPath) {
	eval(fs.readFileSync(inPath, "utf8"));
};

var chunks = [];

var pushChunkFile = function(inType, inFile) {
	var chunk = chunks.slice(-1)[0];
	if (!chunk || !chunk[inType]) {
		chunk = { sheets:[], scripts:[] };
		chunks.push(chunk);
	}
	chunk[inType].push(inFile);
};

module.exports = {
	init: function(inEnyoPath, inLibPath, inMapFrom, inMapTo) {
		script(inEnyoPath + "/loader.js");
		enyo.path.addPaths({
			enyo: inEnyoPath,
			lib: inLibPath
		});
		loader = new enyo.loaderFactory({
			script: function(inScript) {
				pushChunkFile("scripts", inScript);
			},
			sheet: function(inSheet) {
				pushChunkFile("sheets", inSheet);
			}
		});
		loader.loadPackage = function(inScript) {
			if (inMapFrom) {
				var pkgDir = path.dirname(path.relative(process.cwd(), inScript));
				var mapIdx = inMapFrom.indexOf(pkgDir);
				if (mapIdx >= 0) {
					chunks.push(inMapTo[mapIdx]);
					loader.more.apply(loader);
					return;
				}
			}
			script(inScript);
		};
		enyo.depends = function() {
			loader.load.apply(loader, arguments);
		};
	},
	walk: function(inScript, inCallback) {
		//console.log("walking: ", inScript);
		loader.finish = function() {
			inCallback(loader, chunks);
		};
		script(enyo.path.rewrite(inScript));
	},
	reset: function() {
		chunks = [];
	}
}
