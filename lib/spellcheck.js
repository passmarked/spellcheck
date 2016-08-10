// modules
const fs                = require('fs');
const S                 = require('string');
const async             = require('async');
const url               = require('url');
const natural           = require('natural');
const _                 = require('underscore');
const childProcess      = require('child_process');
const request           = require('request');
const querystring       = require('querystring');
const spawn             = childProcess.spawn

/**
* Spell check module to return
**/
var SpellCheck = {};

/**
* As the fallback check the external services
**/ 
SpellCheck.checkService = function(mistakes, fn) {

  // must be configured to call the internal endpoints
  if(!process.env.SPELLCHECK_API_URL)
    return fn(null, mistakes);

  // only if we got actual mistakes
  if(mistakes.length == 0) 
    return fn(null, mistakes);

  // the mistakes to return
  var finalMistakes = [];

  // check each
  async.eachLimit(mistakes, 10, function(mistake, cb) {

    // run through the spelling checkers
    request({

      url:      process.env.SPELLCHECK_API_URL,
      timeout:  1000 * 5,
      method:   'POST',
      type:     'POST',
      form:     {

        word:     S(mistake || '').chompLeft('.').chompRight('.').trim().s.toLowerCase(),
        token:    process.env.SPELLCHECK_API_KEY

      }

    }, function(err, response, body) {

      // must be a 200
      if(body !== 'OK') {

        // add the word
        finalMistakes.push(mistake)

      }

      // done
      cb(null);

    });

  }, function(err) {

    // done
    fn(err, finalMistakes);

  });

};

/**
* Returns a list dictionaries installed on the system
**/
SpellCheck.getLanguages = function(fn) {

  // is this cached already ?
  if(SpellCheck.languages) return fn(null, SpellCheck.languages);

  // execute the actual process
  childProcess.exec([

      '/bin/echo',
      'Q',
      '|',
      '/usr/bin/hunspell',
      '-D'

    ].join(' '), {}, function(err, stdout, stderr) {

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
      if(line.toLowerCase().indexOf('/usr/share') != 0 && 
            line.toLowerCase().indexOf('/library/spelling') != 0) continue;

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

    // just return if blank
    if(code === null || code === undefined)
      return fn(null, languages);

    // dictionaries we found
    var dicts = [];

    // check if we can find the given code in the list of languages
    for(var i = 0; i < (languages || []).length; i++) {

      // get a cleaned code
      var langCode = (languages[i].code || '').toString().toLowerCase();

      // locales
      var langLocal = langCode.split('_')[0];
      var codeLocal = (code || '').toLowerCase().split('_')[0];

      // depends on if the code has only the first param
      if(code.indexOf('_') === -1 && langLocal === codeLocal) {

        // add to the list
        dicts.push(languages[i]);

      } else if(code.toLowerCase() === langCode.split('-')[0]) {

        // yeap and return it
        dicts.push(languages[i]);

      }

    }

    // default to null
    fn(err, dicts);

  });

};

/**
* Accepts language,content and keywords then does a spellcheck on it
**/
SpellCheck.check = function(params, fn) {

  // pull params
  var language    = params.language || null;
  var content     = params.content  || [];
  var words       = [];
  var keywords    = params.keywords || [];

  // loop and add the words
  for(var i = 0; i < content.length; i++) {

    // add the word
    var cleanedWord = content[i];

    // remove all urls
    cleanedWord = cleanedWord.replace(/([--:\w?@%&+~#=]*\.[a-z]{2,4}\/{0,2})((?:[?&](?:\w+)=(?:\w+))+|[--:\w?@%&+~#=]+)?/gi, '');

    // right check if not blank
    if(S(cleanedWord).isEmpty() === true)
      continue;

    // add
    words.push(cleanedWord)

  }

  // get the dictionary file
  SpellCheck.getLanguage(language, function(err, dicts) {

    // default
    var args = [];

    // check for error, and return if any
    if(err) return fn(err);

    // addit
    args.push('-d');
    if(dicts.length > 0) args.push(_.pluck(dicts, 'code').join(','));
    args.push('-a');
    args.push('-l');

    // handle it
    var mistakes = [];

    /**
    * Start the actual process that we will pipe data into
    **/
    var child = spawn('/usr/bin/hunspell', args, {

      stdio: ['pipe', 'pipe', 'ignore']

    });

    // assemble the output
    var chunks  = [];
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

      // done
      var output = Buffer.concat(chunks).toString();

      // mistakes to return 
      var mistakes = [];

      // lines from the output
      var lines = output.split('\n');

      // loop and add to the list
      for(var i = 0; i < lines.length; i++) {

        // get the mistake
        var mistake = lines[i];

        // ignore if empty
        if(S(mistake).isEmpty() === true) continue;

        // skip meta lines
        if(mistake.indexOf('@(#)') == 0) continue;

        // check the word
        var word = S(mistake).trim().s

        // must be more than 1 ...
        if(word.length <= 1) continue;

        // check if the mistake matches one of our keywords
        if(keywords.indexOf(word.toLowerCase()) != -1) continue;

        // should not be a accronym
        if(S(word).trim().s == S(word).trim().s.toUpperCase())
          continue;

        // all good, add it
        mistakes.push( word );

      }

      // run through the service
      SpellCheck.checkService(mistakes, function(err, finalMistakes) {

        // return the mistakes
        fn(err, finalMistakes);

      });

    });

    // get the data
    child.stdout.on('data', function(data) { chunks.push(data); });
    child.on('error', function(err) { callback(err); });
    child.on('close', function() { callback(null); });

    // set a timeout on the process 
    timer = setTimeout(function() {

      callback(new Error('Timed out'));

    }, 1000 * 10);

    // set the encoding to ensure we remain within system limits
    child.stdin.setEncoding('utf-8');

    // write our content out to Hunspell
    child.stdin.write(words.join(' '), function() {

      // close stdin
      child.stdin.end();

    });

  });

}

/**
* Returns the actual model
**/
module.exports = exports = SpellCheck;
