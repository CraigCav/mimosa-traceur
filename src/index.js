"use strict";

var path = require( "path" )
  , _ = require( "lodash" )
  , config = require( "./config" )
  , traceur = require( "traceur" )
  , getExtensions = function ( mimosaConfig ) {
    return mimosaConfig.extensions.javascript;
  };

var compile = function ( mimosaConfig, file, cb ) {
  var error
    , output
    , sourceMap
    , traceurConfig = mimosaConfig.traceur
    , compiler = traceurConfig.lib
    , options = _.extend( {}, traceurConfig, { sourceFiles:[ path.basename( file.inputFileName ) + ".src" ] } );

  // Check if source maps have been excluded for this file
  if ( options.sourceMap ) {
    if ( traceurConfig.sourceMapExclude && traceurConfig.sourceMapExclude.indexOf( file.inputFileName ) > -1 ) {
      options.sourceMap = false;
    } else {
      if ( traceurConfig.sourceMapExcludeRegex && file.inputFileName.match( traceurConfig.sourceMapExcludeRegex ) ) {
        options.sourceMap = false;
      }
    }
  }

  var reporter = new traceur.util.ErrorReporter(),
      project = new traceur.semantics.symbols.Project("/"),
      traceurOptions = {};

  var sourceFile = new traceur.syntax.SourceFile(file.inputFileName, file.inputFileText);

  project.addFile(sourceFile);

  var compiledObjectMap = traceur.codegeneration.Compiler.compile(reporter, project, false);

  if (reporter.hadError()) {
    error ="Compilation failed - " + file.inputFileName;
  } else {
    if (options.sourceMap) {
      traceurOptions.sourceMapGenerator = new traceur.outputgeneration.SourceMapGenerator({
        file: file.name
      });
    }

    output = traceur.outputgeneration.ProjectWriter.write(compiledObjectMap, traceurOptions);

    if (options.sourceMap) {
      sourceMap = traceurOptions.sourceMap;
    }
  }

  cb( error, output, traceurConfig, sourceMap );
};

module.exports = {
  name: "traceur",
  compilerType: "javascript",
  compile: compile,
  extensions: getExtensions,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate,
  cleanUpSourceMaps: true
};