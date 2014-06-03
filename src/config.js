"use strict";

exports.defaults = function() {
  return {
    traceur: {
      exclude: [/\/vendor\//, /\/thirdparty\//],
      sourceMap: true,
      sourceMapDynamic: true,
      sourceMapExclude: [/\/specs?\//, /_spec.js$/],
      sourceMapConditional: false,
      options: {
        experimental: false,
        annotations: false,
        asyncFunctions: false,
        arrowFunctions: false,
        blockBinding: false,
        classes: false,
        computedPropertyNames: false,
        defaultParameters: false,
        destructuring: false,
        forOf: false,
        freeVariableChecker: false,
        generatorComprehension: false,
        generators: false,
        modules: false,
        numericLiterals: false,
        propertyMethods: false,
        propertyNameShorthand: false,
        restParameters: false,
        spread: false,
        symbols: false,
        templateLiterals: false,
        typeAssertions: false,
        types: false
      }
    }
  };
};

exports.placeholder = function() {
  return "\t\n\n"+
         "  traceur:                          # Config settings for the traceur compiler\n" +
         "    exclude: [/\\/vendor\\//, /\\/thirdparty\\//]       # Files to exclude from traceur compilation\n" +
         "    sourceMap: true                 # Whether or not to create source maps\n" +
         "    sourceMapDynamic: true          # Whether or not to inline the source maps in the compiled JavaScript\n" +
         "    sourceMapExclude: [/\\/specs?\\//, /_spec.js$/] # Files to exclude from source map generation\n" +
         "    sourceMapConditional: false     # Whether or not to use conditional source maps\n" +
         "    options:                        # Option flags for the traceur compiler\n" +
         "      experimental: false           # Enable/disable all experimental features at once: true|false\n" +
         "      annotations: false            # true|false|'parse'\n" +
         "      asyncFunctions: false         # true|false|'parse'\n" +
         "      arrowFunctions: false         # true|false|'parse'\n" +
         "      blockBinding: false           # true|false|'parse'\n" +
         "      classes: false                # true|false|'parse'\n" +
         "      computedPropertyNames: false  # true|false|'parse'\n" +
         "      defaultParameters: false      # true|false|'parse'\n" +
         "      destructuring: false          # true|false|'parse'\n" +
         "      forOf: false                  # true|false|'parse'\n" +
         "      freeVariableChecker: false    # true|false\n" +
         "      generatorComprehension: false # true|false|'parse'\n" +
         "      generators: false             # true|false|'parse'\n" +
         "      modules: false                # true|false|'parse'\n" +
         "      numericLiterals: false        # true|false|'parse'\n" +
         "      propertyMethods: false        # true|false|'parse'\n" +
         "      propertyNameShorthand: false  # true|false|'parse'\n" +
         "      restParameters: false         # true|false|'parse'\n" +
         "      spread: false                 # true|false|'parse'\n" +
         "      symbols: false                # true|false|'parse'\n" +
         "      templateLiterals: false       # true|false|'parse'\n" +
         "      typeAssertions: false         # true|false\n" +
         "      types: false                  # true|false|'parse'\n";
};

// Validate that the given option is either a boolean or is a string with the value 'parse'
var ifExistsIsTrueFalseParse = function(errors, fld, obj) {
  if (obj) {
    if ((typeof obj == "string") && (obj.toLowerCase() != "parse")) {
      errors.push("" + fld + " must be true|false|'parse'");
    }
    else if (typeof obj != "boolean") {
      errors.push("" + fld + " must be true|false|'parse'");
    }
  }
}

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
    }

    validators.ifExistsFileExcludeWithRegexAndStringWithField(
      errors,
      "traceur.exclude",
      config.traceur,
      'exclude',
      config.watch.javascriptDir );

    // Validate true/false/parse options
    ifExistsIsTrueFalseParse( errors, "traceur.options.annotations", config.traceur.options.annotations );
    ifExistsIsTrueFalseParse( errors, "traceur.options.asyncFunctions", config.traceur.options.asyncFunctions );
    ifExistsIsTrueFalseParse( errors, "traceur.options.arrowFunctions", config.traceur.options.arrowFunctions );
    ifExistsIsTrueFalseParse( errors, "traceur.options.blockBinding", config.traceur.options.blockBinding );
    ifExistsIsTrueFalseParse( errors, "traceur.options.classes", config.traceur.options.classes );
    ifExistsIsTrueFalseParse( errors, "traceur.options.computedPropertyNames", config.traceur.options.computedPropertyNames );
    ifExistsIsTrueFalseParse( errors, "traceur.options.defaultParameters", config.traceur.options.defaultParameters );
    ifExistsIsTrueFalseParse( errors, "traceur.options.destructuring", config.traceur.options.destructuring );
    ifExistsIsTrueFalseParse( errors, "traceur.options.forOf", config.traceur.options.forOf );
    ifExistsIsTrueFalseParse( errors, "traceur.options.generatorComprehension", config.traceur.options.generatorComprehension );
    ifExistsIsTrueFalseParse( errors, "traceur.options.generators", config.traceur.options.generators );
    ifExistsIsTrueFalseParse( errors, "traceur.options.modules", config.traceur.options.modules );
    ifExistsIsTrueFalseParse( errors, "traceur.options.numericLiterals", config.traceur.options.numericLiterals );
    ifExistsIsTrueFalseParse( errors, "traceur.options.propertyMethods", config.traceur.options.propertyMethods );
    ifExistsIsTrueFalseParse( errors, "traceur.options.propertyNameShorthand", config.traceur.options.propertyNameShorthand );
    ifExistsIsTrueFalseParse( errors, "traceur.options.restParameters", config.traceur.options.restParameters );
    ifExistsIsTrueFalseParse( errors, "traceur.options.spread", config.traceur.options.spread );
    ifExistsIsTrueFalseParse( errors, "traceur.options.symbols", config.traceur.options.symbols );
    ifExistsIsTrueFalseParse( errors, "traceur.options.templateLiterals", config.traceur.options.templateLiterals );
    ifExistsIsTrueFalseParse( errors, "traceur.options.types", config.traceur.options.types );

    // Validate boolean options
    validators.ifExistsIsBoolean( errors, "traceur.options.experimental", config.traceur.options.experimental );
    validators.ifExistsIsBoolean( errors, "traceur.options.freeVariableChecker", config.traceur.options.freeVariableChecker );
    validators.ifExistsIsBoolean( errors, "traceur.options.typeAssertions", config.traceur.options.typeAssertions );
  }

  return errors;
};