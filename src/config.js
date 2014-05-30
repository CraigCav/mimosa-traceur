"use strict";

exports.defaults = function() {
  return {
    traceur: {
      sourceMap: true,
      sourceMapDynamic: true,
      sourceMapExclude: [/\/specs?\//, /_spec.js$/],
      sourceMapConditional: false
    }
  };
};

exports.placeholder = function() {
  return "\t\n\n"+
         "  traceur:                       # config settings for the traceur compiler module\n" +
         "    sourceMap: true              # whether or not to create source maps\n" +
         "    sourceMapDynamic: true       # whether or not to inline the source maps in the compiled JavaScript\n" +
         "    sourceMapExclude: [/\\/specs?\\//, /_spec.js$/] # files to exclude from source map generation\n" +
         "    sourceMapConditional: false  # whether or not to use conditional source maps\n"; +
         "    experimental: false          # Turn on experimental features like 'let' block binding, arrow functions, etc."
};

exports.validate = function(config, validators) {
  var errors = [];

  if ( validators.ifExistsIsObject( errors, "traceur config", config.traceur ) ) {

    if ( config.isBuild ) {
      config.traceur.sourceMap = false;
    } else {
      validators.ifExistsIsBoolean( errors, "traceur.sourceMapConditional", config.traceur.sourceMapConditional );

      if ( validators.ifExistsIsBoolean( errors, "traceur.sourceMapDynamic", config.traceur.sourceMapDynamic ) ) {
        if (config.isWatch && config.isMinify && config.traceur.sourceMapDynamic ) {
          config.traceur.sourceMapDynamic = false;
          config.log.debug( "mimosa watch called with minify, setting traceur.sourceMapDynamic to false to preserve source maps." );
        }
      }

      validators.ifExistsFileExcludeWithRegexAndStringWithField(
        errors,
        "traceur.sourceMapExclude",
        config.traceur,
        'sourceMapExclude',
        config.watch.javascriptDir );

      validators.ifExistsIsBoolean( errors, "traceur.experimental", config.traceur.experimental );
    }
  }

  return errors;
};