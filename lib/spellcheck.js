// modules
const fs                = require('fs');
const S                 = require('string');
const async             = require('async');
const url               = require('url');
const natural           = require('natural');
const _                 = require('underscore');
const childProcess      = require('child_process');
const spawn             = childProcess.spawn

/**
* Spell check module to return
**/
var SpellCheck = {};

/**
* Returns a list dictionaries installed on the system
**/
SpellCheck.getLanguages = function(fn) {

  // is this cached already ?
  if(SpellCheck.languages) return fn(null, SpellCheck.languages);

  // execute the actual process
  childProcess.exec([

      'ECHO QUIT',
      '|',
      '/usr/bin/hunspell',
      '-D'

    ].join(' '), {}, function(err, stdout, stderr) {

    // check the error
    if(err) {

      // done
      return fn(err);

    }

    // to string just in case
    stdout = (stdout || '').toString();
    stderr = (stderr || '').toString();

    // list of languages
    var languages     = [];
    var languageFiles = [];

    // get all the lines
    var lines = stderr.split('\n');

    // loop and load the languages
    for(var i = 0; i < lines.length; i++) {

      // local ref
      var line = lines[i];

      // is this a dictionary ?
      if(line.toLowerCase().indexOf('/usr/share') != 0) continue;

      // get the code
      var code = line.slice(line.lastIndexOf('/')+1, line.length);
      var path = line.toString(); // shallow copy

      // the code must not contain a "."
      if(code.indexOf('.') != -1) {

        // devide them up then
        code = code.split('.')[0];
        path = path.split('.')[0];

      }

      // if not already in list
      if(languageFiles.indexOf(code) != -1) continue;

      // append to the list
      languages.push({

        code: code,
        path: path,

      });
      languageFiles.push(code);

    }

    // set the cache
    if(languages && languages.length > 0)
      SpellCheck.languages = languages;

    // done
    fn(null, languages);

  });

};

/**
* Returns a single language if supported with it's dictionary details 
**/
SpellCheck.getLanguage = function(code, fn) {

  // first get all the languages
  this.getLanguages(function(err, languages) {

    // return a error if any
    if(err) return fn(err);

    // dictionaries we found
    var dicts = [];

    // check if we can find the given code in the list of languages
    for(var i = 0; i < (languages || []).length; i++) {

      // get a cleaned code
      var langCode = (languages[i].code || '').toString().toLowerCase();

      // locales
      var langLocal = langCode.split('_')[0];
      var codeLocal = code.toLowerCase().split('_')[0];

      // depends on if the code has only the first param
      if(code.indexOf('_') === -1 && langLocal === codeLocal) {

        // add to the list
        dicts.push(languages[i]);

      } else if(code.toLowerCase() === langCode) {

        // yeap and return it
        dicts.push(languages[i]);

      }

    }

    // default to null
    fn(null, dicts);

  });

};

/**
* Accepts language,content and keywords then does a spellcheck on it
**/
SpellCheck.check = function(params, fn) {

  // pull params
  var language    = (params.language || 'en').toLowerCase().replace('-', '_');
  var content     = params.content || '';
  var keywords    = params.keywords || [];

  // get the dictionary file
  SpellCheck.getLanguage(language, function(err, dicts) {

    // check for error, and return if any
    if(err) return fn(err);

    // check if we found the language
    if(!dicts || dicts.length === 0) return fn(null, []); // for now just return a empty array

    // handle it
    var mistakes = [];

    /**
    * Start the actual process that we will pipe data into
    **/
    var child = spawn('/usr/bin/hunspell', [

        '-d',
        _.pluck(dicts, 'code'),
        '-a',
        '-l'

      ], {

        stdio: ['pipe', 'pipe', 'ignore']

      });

    // assemble the output
    var output  = '';
    var timer   = null;

    /**
    * Callback to handle cleanup when done
    **/
    var callback = _.once(function(err) {

      // stop the timer if not already
      if(timer) clearTimeout(timer);

      // close the client if not already
      try {

        // kill
        child.kill();

      } catch(err) {}

      // mistakes to return 
      var mistakes = [];

      // lines from the output
      var lines = output.split('\n');

      // loop and add to the list
      for(var i = 0; i < lines.length; i++) {

        // get the mistake
        var mistake = lines[i];

        // ignore if this is a system message 
        if(mistake.indexOf('@(#)') === 0) continue;

        // ignore if empty
        if(S(mistake).isEmpty() === true) continue;

        // check if the mistake matches one of our keywords
        // if(keywords.indexOf(mistake.toLowerCase()) != -1) continue;

        // should not be a accronym
        if(S(mistake).trim().s == S(mistake).trim().s.toUpperCase())
          continue;

        // all good, add it
        mistakes.push( mistake );

      }

      // return the mistakes
      fn(null, mistakes);

    });

    // get the data
    child.stdout.on('data', function(data) { output = output + data.toString(); });
    child.on('error', function(err) { callback(err); });
    child.on('close', function() { callback(null); });

    // set a timeout on the process 
    timer = setTimeout(function() {

      callback(new Error('Timed out'));

    }, 1000 * 10);

    // set the encoding to ensure we remain
    // within system limits
    child.stdin.setEncoding('utf-8');

    // write our content out to Hunspell
    child.stdin.write(content, function() {

      // close stdin
      child.stdin.end();

    });

  });

}

/**
* Returns the actual model
**/
module.exports = exports = SpellCheck;
