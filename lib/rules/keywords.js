// pull in the required modules
const url           = require('url');
const cheerio       = require('cheerio');
const S             = require('string');
const async         = require('async');
const spellingFunc  = require('../spellcheck');

/**
* expose our function
**/ 
module.exports = exports = function(payload, fn) {

  // get the data
  var data = payload.getData()

  // parse the url 
  var uri = url.parse(data.url)

  // go get our content
  payload.getPageContent(function(err, content) {

    // did we get a error ?
    if(err) {

      // debug
      payload.error('Got a error trying to get the Page Content', err);

      // done
      return fn(null);

    }

    // did we find content ?
    if(S(content || '').isEmpty() === true) return fn(null);

    // load html
    var $ = cheerio.load(content || '');

    // get the page titles and create one content
    var lang = $('html').attr('lang')

    // the language must be set
    if(S(lang).isEmpty() === true) return fn(null);

    // get tlines
    var lines = content.split('\n')
    
    // loop all the titles .. ? YOu should actually only have one
    async.each($('head meta[name=keywords]'), function(keywordEl, cb) {

      // get the description
      var elementContent = $(keywordEl).attr('content') || '';

      // get the content
      spellingFunc.check({

          content: elementContent,
          keywords: [ uri.hostname ].join(''),
          language: lang || 'en'

        }, function(err, mistakes) {

          // did we have any error ?
          if(err) {

            // debug
            payload.error('Something went wrong getting mistakes from ASPELL', err);

            // try again
            return cb(null);

          }

          // add a rule if we have any
          if((mistakes || []).length === 0) return cb(null);

          // keep track of the last line
          var current_last_line = -1;

          // get the min counters for each mistake
          var minMistakes = {};

          // loop && add each
          for(var i = 0; i < mistakes.length; i++) {

            //get the local reference
            var mistake = mistakes[i];

            // get the code
            var build = payload.getSnippetManager().build(

              lines, 
              minMistakes[mistake] || -1,
              function(line) {
              
                return line.indexOf(mistake) != -1 && 
                        line.toLowerCase().indexOf('<meta') != -1 && 
                            line.toLowerCase().indexOf('keywords') != -1;

              }

            );

            // sanity check
            if(!build) continue;

            // set the line
            minMistakes[mistake] = build.subject;

            // build the message
            instance_message = '$';
            identifiers_strs = [ mistake ];

            // if found
            if(mistake.suggestion) {

              instance_message + ' did you perhaps mean $ ?'
              identifiers_strs.push(mistake.suggestion);

            }

            // add it
            payload.addRule({

                key:          'keywords',
                message:      'Spelling mistake in document keywords',
                type:         'notice'

              }, {

                code:         build,
                display:      'code',
                message:      instance_message,
                identifiers:  identifiers_strs

              })

          }

          // done
          cb(null);

        });

    }, function() { fn(null); })

  });

};
