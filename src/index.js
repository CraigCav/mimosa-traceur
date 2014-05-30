"use strict";

var _ = require('lodash'), 
    config = require('./config'), 
    traceur = require('traceur');

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

  // Turn on/off the experimental features in Traceur
  traceur.options.experimental = mimosaConfig.traceur.experimental;

  return mimosaOptions.files.forEach(function(file) {
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