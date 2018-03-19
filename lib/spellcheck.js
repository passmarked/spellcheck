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
const CLD               = require('cld');
const spawn             = childProcess.spawn;

/**
* Spell check module to return
**/
var SpellCheck = {};

/**
* removes HTML tags from the given text
**/
SpellCheck.trim = function(text) {

  // return them
  return text.replace(/(<([^>]+)>)/gi, ' ');

};

/**
* Tokenize the given word
**/
SpellCheck.tokenize = function(word) {

  // the results to return
  var results = [];

  // split with all the capitals
  var sections = word.split(/(?=[A-Z])/);

  // keep track of current word
  var capitalChars = [];

  // loop them all
  for(var i = 0; i < sections.length; i++) {

    // check it
    if(sections[i].length == 1) {

      // add to capital list and move on
      capitalChars.push(sections[i]);

    } else {

      // right so join the capitals for last word
      if(capitalChars.length > 0)
        results.push(capitalChars.join(''));

      // clear them
      capitalChars = [];

      // add the word
      results.push(sections[i]);

    }

  }

  // add the last word
  if(capitalChars.length > 0)
    results.push(capitalChars.join(''));

  // done
  return results;

};

/**
* As the fallback check the external services
**/ 
SpellCheck.checkService = function(payload, mistakes, fn) {

  // get the environment settings
  var settings = _.extend({}, process.env)
  
  // sanity check
  if(!mistakes)
    return fn(null, []);

  // must be configured to call the internal endpoints
  if(!settings.SPELLCHECK_API_URL)
    return fn(null, mistakes);

  // only if we got actual mistakes
  if((mistakes || []).length == 0) 
    return fn(null, mistakes);

  // list of valid mistakes
  var validMistakes = [];
  var finalMistakes = [];

  // keep a local cache of responses from the server
  var serverCachedResponses = {};

  // words to check
  var words     = [];
  var lowWords  = [];

  // loop it all
  for(var i = 0; i < (mistakes || []).length; i++) {

    // skip if no token
    if(!mistakes[i].word) continue;

    // the segment used
    var segment = mistakes[i].word || null;

    // remove empty string
    if(S(segment).isEmpty() === true) continue;

    // check if acronym
    if((segment || '').toUpperCase() === segment) continue;

    // add the words
    if(lowWords.indexOf(segment) === -1) {

      // add the words
      lowWords.push((segment || '').toLowerCase())
      words.push(segment);

    }

  }

  // loop it all
  for(var i = 0; i < (mistakes || []).length; i++) {

    // skip if no token
    if(!mistakes[i].token) continue;

    // the segment used
    var segment = mistakes[i].token || null;

    // remove empty string
    if(S(segment).isEmpty() === true) continue;

    // check if acronym
    if((segment || '').toUpperCase() === segment) continue;

    // add the words
    if(lowWords.indexOf(segment) === -1) {

      // add the words
      lowWords.push((segment || '').toLowerCase())
      words.push(segment);

    }

  }

  // loop it all
  async.eachLimit(lowWords, 10, function(word, cb) {

    // get the segment
    var segment = S(word || '').chompLeft('.').chompRight('.').trim().s.toLowerCase();

    // the cache key to use
    var cacheKey = [

      'passmarked',
      'dictionaries',
      S(segment).slugify().s

    ].join(':');

    // check the cache
    payload.get(cacheKey, function(err, cachedResult) {

      // did we get it ?
      if(cachedResult) {

        // debugging
        payload.debug('checkService', 'Got cached result for: ' + cachedResult);

        // set it
        serverCachedResponses[segment] = cachedResult;

        // done
        return setImmediate(cb, null);

      }

      // run through the spelling checkers
      request({

        url:      settings.SPELLCHECK_API_URL,
        timeout:  1000 * 5,
        method:   'POST',
        type:     'POST',
        form:     {

          word:     segment,
          token:    settings.SPELLCHECK_API_KEY

        }

      }, function(err, response, body) {

        // the result
        var resultingBody = (body || 'OK').toString();

        console.log(segment + ' --- ' + resultingBody)

        // set in the cache
        payload.set(cacheKey, resultingBody, function() {

          // set the response
          serverCachedResponses[segment] = resultingBody;

          // done
          setImmediate(cb, null);

        });

      });

    });

  }, function(err) {

    // loop the words and add all the mistakes
    for(var i = 0; i < mistakes.length; i++) {

      // get the segment
      var segment = mistakes[i].word || null;

      // must be defined
      if(!segment) continue;

      // check if defined
      if(serverCachedResponses[(segment || '').toLowerCase()] === 'BAD') {

        // check the token
        if(mistakes[i].token) {

          // get the segment
          var subsegment = mistakes[i].token || null;

          // must be defined
          if(!subsegment) continue;

          // check if defined
          if(serverCachedResponses[(subsegment || '').toLowerCase()] === 'BAD') {

            // add to the list
            finalMistakes.push(mistakes[i]);

          }

        } else {

          // add to the list
          finalMistakes.push(mistakes[i]);

        }

      }

    }

    // finish strong
    setImmediate(fn, err, finalMistakes);

  });

};

/**
* Returns the list of supported language codes
**/
SpellCheck.getLanguageCodes = function(fn) {

  // return cached version
  if(global.passmarkedLoadedLanguageCodes)
    return fn(null, global.passmarkedLoadedLanguageCodes);

  // get the languages
  SpellCheck.getLanguages(function(err, languages) {

    // get all the codes
    var codes = _.pluck(languages || [], 'code');

    // define globally to speed up lookups
    global.passmarkedLoadedLanguageCodes = codes;

    // returns the codes
    fn(err, codes);

  });

};

/**
* Returns a list of dictionaries installed on the system
**/
SpellCheck.getLanguages = function(fn) {

  // is this cached already ?
  if(global.passmarkedLoadedLanguages) return fn(null, global.passmarkedLoadedLanguages);

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

      // replace the - with _
      code = (code || '').replace(/\-/gi, '_');

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
      global.passmarkedLoadedLanguages = languages;

    // done
    fn(null, languages);

  });

};

/**
* Returns a single language if supported with it's dictionary details 
**/
SpellCheck.getLanguage = function(code, fn) {

  // first get all the languages
  SpellCheck.getLanguages(function(err, languages) {

    // dictionaries we found
    var dicts = [];

    // clean the code
    var localCode = code.replace(/\-/gi, '_').toLowerCase();

    // check if we can find the given code in the list of languages
    for(var i = 0; i < (languages || []).length; i++) {

      // clean the language
      var localLang = languages[i].code.replace(/\-/gi, '_').toLowerCase();

      // add to list
      if(localLang.indexOf(localCode) === 0) {

        // add to the list
        dicts.push(languages[i]);

      }

    }

    // default to null
    fn(err, dicts);

  });

};

/**
* Accepts language, content and keywords then does a spellcheck on it
**/
SpellCheck.check = function(params, fn) {

  // pull params
  var language    = params.language || null;
  var content     = params.content  || [];
  var words       = [];
  var keywords    = params.keywords || [];
  var dicts       = [];
  var payload     = params.payload;

  // loop and add the words
  for(var i = 0; i < content.length; i++) {

    // add the word
    var cleanedLine = content[i];

    // remove all urls
    cleanedLine = cleanedLine.replace(/([--:\w?@%&+~#=]*\.[a-z]{2,4}\/{0,2})((?:[?&](?:\w+)=(?:\w+))+|[--:\w?@%&+~#=]+)?/gi, '');
    cleanedLine = S(cleanedLine || '').chompLeft('.').chompRight('.').trim().s

    // right check if not blank
    if(S(cleanedLine).trim().isEmpty() === true)
      continue;

    // right check if not blank
    if(S(cleanedLine).trim().endsWith('..') === true)
      continue;

    // loop the sentence and remove words we are not fans of
    var segments  = cleanedLine.split(' ');
    var wording   = [];

    // loop and add them all
    for(var a = 0; a < segments.length; a++) {

      // check if not empty
      if(S(segments[a]).isEmpty() === true)
        continue;

      // get the code
      var code = segments[a].charCodeAt(0);

      // check if part of our list
      if((code < 97 || code > 122) && 
          (code < 65 || code > 90)) 
            continue;

      if(segments[a] == S(segments[a] || '').capitalize().s)
        continue;

      // must not contain a number
      if((segments[a] || '').match(/\d+/gi) != null)
        continue;

      // add to the list
      wording.push(segments[a]);

    }

    // skip if empty
    if(wording.length === 0) continue;

    // add
    words.push(wording.join(' '))

  }

  // add all the params
  var patterns        = [];
  var dicts           = [];
  var definedDicts    = [];
  var suggestedDicts  = [];

  // get all the languages
  async.parallel([

    function(cb) {

      // add each lowered
      for(var i = 0; i < (keywords || []).length; i++) {

        // check if not empty
        if( S(keywords[i] || '').isEmpty() === true ) {

          // nope, ignore this one
          continue;

        }

        // add it
        patterns.push( (keywords[i] || '').toLowerCase() );

      }

      // done
      cb(null);

    },
    function(cb) {

      // check if a language was given
      if(language !== null) return cb(null);

      // we try to detect the language then
      CLD.detect(words.join(' '), function(err, result) {

        // the language code to check
        var languageCode = null;

        // check if we got a result
        if(result && 
            result.reliable === true &&
              (result.languages || []).length > 0 && 
                result.languages[0].code) {

          // set the code if any found
          languageCode = (result.languages[0].code || '').toLowerCase();

        }

        // check if given
        if(languageCode === null) {

          // then nope out of here
          return setImmediate(cb, null);

        }

        // get the dictionary file
        SpellCheck.getLanguage(languageCode, function(err, dicts) {

          // add to the list of detected dictionaries
          suggestedDicts = [].concat(dicts);

          // done
          setImmediate(cb, err);

        });

      });

    },
    function(cb) {

      // get the languages
      SpellCheck.getLanguage(language || 'en', function(err, dicts) {

        // add to the list of detected dictionaries
        definedDicts = [].concat(dicts);

        // done
        setImmediate(cb, err);

      });

    }

  ], function(err) {

    // loop through the error
    for(var i = 0; i < suggestedDicts.length; i++) {

      // if the total length is less
      if(dicts.length < 10) {

        // add the dict
        dicts.push(suggestedDicts[i]);

      }

    }

    // loop through the error
    for(var i = 0; i < definedDicts.length; i++) {

      // if the total length is less
      if(dicts.length < 10) {

        // add the dict
        dicts.push(definedDicts[i]);

      }

    }

    // default
    var args = [];

    // add the arguments
    args.push('-d');
    if(dicts && dicts.length > 0) {

      // add the dicts
      args.push(_.pluck(dicts, 'path').join(','));

    }
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
        var word = S(mistake).trim().s;
        
        // must be more than 1 ...
        if(word.length <= 1) continue;

        // flag to track it
        var keywordTrack = true;

        // check all the patterns
        for(var a = 0; a < patterns.length; a++) {

          // check if the keyword contains the word
          if(patterns[a].indexOf(word.toLowerCase()) !== -1) {

            // ignore this word
            keywordTrack = false;

            // done
            break;

          }

        }

        // check if the mistake matches one of our keywords
        if(keywordTrack === false) continue;

        // should not be an acronym
        if(word == word.toUpperCase())
          continue;

        // should not be an acronym
        if(word == S(word || '').capitalize().s)
          continue;

        // get all the tokens
        var tokens = SpellCheck.tokenize(word);

        // add all
        for(var a = 0; a < (tokens || []).length; a++) {

          // does it match ?
          if(tokens[a] === word) {

            // all good, add it
            mistakes.push( {

              word:     word

            } );

          } else {

            // all good, add it
            mistakes.push( {

              token:    tokens[a],
              word:     word

            } );

          }

        }

      }

      // run through the service
      SpellCheck.checkService(payload, mistakes, function(err, finalMistakes) {
          
        // return the mistakes
        setImmediate(fn, err, finalMistakes);

      });

    });

    // get the data
    child.stdin.on('error', function(err) { callback(err); });
    child.stdout.on('error', function(err) { callback(err); });
    child.stdout.on('data', function(data) { chunks.push(data); });
    child.on('error', function(err) { callback(err); });
    child.on('close', function() { callback(null); });

    // set a timeout on the process 
    timer = setTimeout(function() {

      callback(new Error('Timed out'));

    }, 1000 * 10);

    try {

      // set the encoding to ensure we remain within system limits
      child.stdin.setEncoding('utf-8');

      // write our content out to Hunspell
      child.stdin.write(words.join(' '), function() {

        // close stdin
        child.stdin.end();

      });

    } catch(err) {

      callback(err);

    }

  });

}

/**
* Returns the actual model
**/
module.exports = exports = SpellCheck;
