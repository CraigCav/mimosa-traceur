"use strict";

var _ = require('lodash'), 
    config = require('./config'), 
    path = require('path'),
    traceur = require('traceur');

var compile = function (mimosaConfig, mimosaOptions, next) {
  var error, 
      options = _.extend( {}, mimosaConfig.traceur),
      i = 0,
      newFiles = [],
      whenDone = mimosaOptions.files && mimosaOptions.files.length,
      logger = mimosaConfig.log;

  var hasFiles = mimosaOptions.files ? !!mimosaOptions.files.length : false;

  if (!hasFiles) return next();

  var done = function() {
    if (++i === whenDone) {
      mimosaOptions.files = newFiles;
      return next();
    }
  };

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

    var sourceFile = new traceur.syntax.SourceFile(file.inputFileName, file.inputFileText);
    project.addFile(sourceFile);

    var compiledObjectMap = traceur.codegeneration.Compiler.compile(reporter, project, false);

    if (reporter.hadError()) {
      logger.error('Compilation failed - '+file.inputFileName, {
        exitIfBuild: true
      });
    }

    if (options.sourceMap) {
      traceurOptions.sourceMapGenerator = new traceur.outputgeneration.SourceMapGenerator({
        file: file.inputFileName
      });
    }

    var result = traceur.outputgeneration.ProjectWriter.write(compiledObjectMap, traceurOptions);

    if (options.sourceMap) {
      
      var extName;
      extName = path.extname(file.inputFileName);
      var sourceMap = JSON.parse(traceurOptions.sourceMap);
      sourceMap.sources[0] = path.basename(file.inputFileName).replace(extName, ".js.map");
      sourceMap.sourcesContent = [file.inputFileText];
      sourceMap.file = path.basename(file.outputFileName);
      var base64SourceMap = new Buffer(JSON.stringify(sourceMap)).toString('base64');
      var datauri = 'data:application/json;base64,' + base64SourceMap;
      result = "" + result + "\n//# sourceMappingURL=" + datauri + "\n";
    }

    file.outputFileText = result;

    newFiles.push(file);

    done();
  });
};

var registration = function ( mimosaConfig, register ) {
  register(['add','update','buildFile'], 'compile', compile, mimosaConfig.extensions.javascript);
};

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate,
  cleanUpSourceMaps: true
};