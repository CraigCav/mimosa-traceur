"use strict";

var _ = require('lodash'), 
    config = require('./config'), 
    traceur = require('traceur');

// Apply options from Mimosa to Traceur
var setTraceurOptions = function ( traceur, options ) {
  for (var optionName in options) {
    if (options.hasOwnProperty(optionName)) {
      // Only apply options that are truthy (e.g., true or 'parse')
      if (options[optionName]) {
        traceur.options[optionName] = options[optionName];
      }
    }
  }
}

var isFileExcludedFromCompilation = function(fileName, excludeRegex) {
  if (fileName.match( excludeRegex)) {
    // This file is excluded from compilation by traceur
    return true;
  }
  return false;
}

var compile = function (mimosaConfig, mimosaOptions, next) {
  var error, 
      options = _.extend( {}, mimosaConfig.traceur),
      i = 0,
      newFiles = [],
      whenDone = mimosaOptions.files.length,
      logger = mimosaConfig.log;

  var hasFiles = mimosaOptions.files ? !!mimosaOptions.files.length : false;

  if (!hasFiles) return next();

  var done = function() {
    if (++i === whenDone) {
      mimosaOptions.files = newFiles;
      return next();
    }
  };

  setTraceurOptions( traceur, mimosaConfig.traceur.options );

  return mimosaOptions.files.forEach(function(file) {
    // Check if this file is excluded from compilation
    if (isFileExcludedFromCompilation( file.inputFileName, mimosaConfig.traceur.excludeRegex )) {
      // Do nothing for files that are excluded from compilation
      file.outputFileText = file.inputFileText;
    } else {
      // Check if source maps have been excluded for this file
      if ( options.sourceMap ) {
        if ( options.sourceMapExclude && options.sourceMapExclude.indexOf( file.inputFileName ) > -1 ) {
          options.sourceMaps = false;
        } else {
          if ( options.sourceMapExcludeRegex && file.inputFileName.match( options.sourceMapExcludeRegex ) ) {
            options.sourceMaps = false;
          }
        }
      }

      var reporter = new traceur.util.ErrorReporter(),
          project = new traceur.semantics.symbols.Project('/'),
          traceurOptions = {};

      var sourceFile = new traceur.syntax.SourceFile(file.inputFileName, file.outputFileText || file.inputFileText);
      project.addFile(sourceFile);

      var compiledObjectMap = traceur.codegeneration.Compiler.compile(reporter, project, false);

      if (reporter.hadError()) {
        logger.error('Compilation failed - '+file.inputFileName, {
          exitIfBuild: true
        });
        return;
      }
      
      // No errors, so go ahead and generate the transformed code
      if (options.sourceMaps) {
        traceurOptions.sourceMapGenerator = new traceur.outputgeneration.SourceMapGenerator({
          file: file.inputFileName
        });
      }

      var writerConfig = {};
      var result = traceur.outputgeneration.ProjectWriter.write(compiledObjectMap, writerConfig);

      if (options.sourceMaps) {
        file.sourceMap = traceurOptions.sourceMap;
      }

      file.outputFileText = result;
    }
    newFiles.push(file);

    done();
  });
};

var registration = function ( mimosaConfig, register ) {
  register(['add','update','buildFile'], 'afterCompile', compile, mimosaConfig.extensions.javascript);
}

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate
};