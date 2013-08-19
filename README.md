Enyo Builder
============

An alternative to the enyo minifier build tool that comes with the bootplate application. Key benefits are as follows:

1. Bundles everything into one css file and one javascript file. No separate files for enyo and your project.
2. Ability to generate a source map of the bundled javascript file for debugging purposes.
3. You can run this as a command line tool from anywhere. You don't have to be in a specific directory to execute the build. All you need to do is tell the tool where the main enyo directory is. This is only necessary for the enyo dependency loader to work properly.
4. Available as an npm module. Whee!

Installation
------------

`npm install enyo-builder -g`

You don't have to install it globally, but if you do, then you can run it with `enyo-builder` from anywhere instead of `./bin/enyo-builder` from the locally installed path.

Assumptions
-----------

This assumes that your project is structured like so:

```
/
  enyo/
  lib/
  assets/
  source/
  build/
```

Your project's package dependency files must be named `package.js`.

Limitations
-----------

No support for less just yet. It wouldn't be difficult to add, but I'm not using it in my projects, so I didn't throw it in. In order for the script to bundle the enyo source with your project, you have to list enyo as a dependency in your project's `package.js` file. And when you do it, do it like this:

```JavaScript
enyo.depends(
  "$enyo/source/boot",
  "$enyo/source",
  // ... Other files needed by your project.
);
````

Usage
-----

If the module is installed globally, do this:

`enyo-builder -e /path/to/enyo/directory`

The path to the enyo directory can be absolute or relative. Your main `index.html` for your application needs the following in order to load the bundled css and javascript files:

```HTML
<!-- BUILD VERSION -->
<link rel="stylesheet" href="build/bundle.css">
<script src="build/bundle.js"></script>
````

Adjust the src path accordingly for your environment.

Options
-------

* `-e, --enyo`: Absolute or relative path to main enyo directory. This is the only required option. This is needed in order for the enyo dependency loader to work correctly.
* `-s, --source`: Path to your project source files. Default is to assume your source lives at the same level as enyo directory.
* `-o, --output`: Absolute or relative path to your build directory. Default is `build` at the same level as your project source files.
* `-m, --sourcemap`: Specify this option if you want the script to generate a source map file from your bundled files.

Notes
-----

If you are loading enyo separately from your project files, simply omit the references to `$enyo/source/boot` and `$enyo/source` from your project's `package.js` file. The script will only bundle your project's source files in that case.

Script paths in the generated source map file will be relative to the `bundle.js` output file which is located in `build/` by default. If you use the `-o` option to write the generated bundle files to another location, then the script paths in the source map will be relative from your specified output path. There are probably some environments where this will not work properly.
