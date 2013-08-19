var
walker    = require("./walker"),
path      = require("path"),
fs        = require("fs"),
uglify    = require("uglify-js"),
baseDir   = process.cwd(),
jsBuffer  = "",
mapBuffer = "",
cssBuffer = "",
outPath;

module.exports = exports = Builder;

function Builder( options ) {
  this.options        = options;
  this.enyoPath       = path.resolve( baseDir, this.options.enyo );
  this.enyoSourcePath = this.enyoPath + "/source";
  this.sourcePath     = path.resolve( baseDir, ( this.options.source || this.enyoPath + "/../source" ) ),
  this.outPath        = !this.options.output ? path.resolve( this.sourcePath, "../build" ) : path.resolve( baseDir, path.resolve( baseDir, this.options.output ) );
  outPath             = this.outPath;
}

Builder.prototype.build = function() {
  this.buildProject();
  this.createOutputFiles();
}

Builder.prototype.buildProject = function() {

  var
  libPath     = path.resolve( this.sourcePath, "../lib" ),
  packagePath = path.resolve( this.sourcePath, "package.js" );

  // Change process' cwd to project source files for walker.
  process.chdir( this.sourcePath );

  // Init walker and read package files using loader script
  walker.init( this.enyoPath, libPath );
  walker.walk( packagePath, this.walkerFinished );

  // Reset chunks in case you want to init and walk again.
  walker.reset();

}

// Outputs to build if no options specified.
Builder.prototype.createOutputFiles = function() {

  fs.writeFileSync( this.outPath + "/bundle.js", jsBuffer );
  fs.writeFileSync( this.outPath + "/bundle.css", cssBuffer );

  // Write source map file if desired. Append reference to bundle.js file.
  if ( this.options.sourcemap == "true" ) {
    fs.writeFileSync( this.outPath + "/bundle.js.map", mapBuffer );
    fs.appendFileSync( this.outPath + "/bundle.js", "\n/*\n//@ sourceMappingURL=bundle.js.map\n*/" );
  }
}

// Callback called when the enyo script loader finishes walking the tree.
Builder.prototype.walkerFinished = function( loader, chunks ) {

  console.log( "Script count: %d", chunks[0].scripts.length );
  console.log( "Stylesheet count: %d", chunks[0].sheets.length );

  var
  scripts  = absolutePaths( chunks[0].scripts ),
  sheets   = absolutePaths( chunks[0].sheets );

  // Change to output path so that you can make source map script paths correct.
  process.chdir( outPath );

  // Convert scripts and sheets to relative paths. Relative from build directory.
  scripts = relativePaths( scripts );
  sheets = relativePaths( sheets );

  jsResult = uglify.minify( scripts, {
    outSourceMap: "bundle.js.map"
  });

  // Append to buffers
  jsBuffer += jsResult.code;
  mapBuffer += jsResult.map;
  concatCss( sheets );

}

function concatCss( sheets ) {

  var
  css;

  for ( var i = 0; i < sheets.length; i++ ) {
    css = fs.readFileSync( sheets[i] ).toString();
    // Fix reference to url() in stylesheets.
    css = fixUrlPaths( css, sheets[i] );
    cssBuffer += css + "\n";
  }

}

function fixUrlPaths( code, sheetPath ) {
  code = code.replace(/url\([^)]*\)/g, function( inMatch ) {

    // find the url path, ignore quotes in url string
    var
    matches           = /url\s*\(\s*(('([^']*)')|("([^"]*)")|([^'"]*))\s*\)/.exec(inMatch),
    urlPath           = matches[3] || matches[5] || matches[6],
    normalizedUrlPath = path.join( sheetPath, "..", urlPath ),
    relPath           = path.relative( outPath, normalizedUrlPath );

    // skip data urls
    if ( /^data:/.test( urlPath ) ) {
      return "url(" + urlPath + ")";
    }

    // skip an external link
    if ( /^http(:?s)?:/.test( urlPath ) ) {
      return "url(" + urlPath + ")";
    }

    if (process.platform == "win32") {
      relPath = pathSplit(relPath).join("/");
    }

    return "url(" + relPath + ")";

  });
  return code;
}

// properly split path based on platform
function pathSplit(inPath) {
  var sep = process.platform == "win32" ? "\\" : "/";
  return inPath.split(sep);
}

// Array of relative paths to absolute paths.
function absolutePaths( inArray ) {

  var
  outArray = [];

  for ( var i = 0; i < inArray.length; i++ ) {
    outArray[i] = path.resolve( process.cwd(), path.join( path.dirname( inArray[i] ), path.basename( inArray[i] ) ) );
  }
  return outArray;

}

// Array of absolute to relative paths.
function relativePaths( inArray ) {

  var
  outArray = [];

  for ( var i = 0; i < inArray.length; i++ ) {
    outArray[i] = path.relative( process.cwd(), inArray[i] );
  }
  return outArray;

}
