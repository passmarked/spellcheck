const url           = require('url');
const cheerio       = require('cheerio');
const S             = require('string');
const async         = require('async');
const spellingFunc  = require('../spellcheck');

/**
* Expose our description tag check
**/
module.exports = exports = function(payload, fn) {

  // get the data
  var data = payload.getData();

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

    // get the page titles && create one content
    var lang = $('html').attr('lang');

    // the language must be set
    if(S(lang).isEmpty() === true) return fn(null);

    // get tlines
    var lines = content.split('\n');
    
    // loop all the titles .. ? YOu should actually only have one
    async.each($('head meta[name=description]'), function(descEl, cb) {

      // get the description
      var description = $(descEl).attr('content') || '';

      // get the content
      spellingFunc.check({

          content:  description,
          keywords: [ uri.hostname ].join(''),
          language: lang || 'en'

        }, function(err, mistakes) {

          // did we have any error ?
          if(err) {

            // debug
            payload.error('Something went wrong getting mistakes from ASPELL', err)

            // try again
            return cb(null);

          }

          // add a rule if we have any
          if((mistakes || []).length == 0) return cb(null);

          // keep track of the last line
          var current_last_line = -1;

          // loop && add each
          for(var i = 0; i < mistakes.length; i++) {

            //get the local reference
            var mistake = mistakes[i];

            // get the code
            var build = payload.getSnippetManager().build(


              lines, 
              current_last_line, 
              function(line) {
              
                return line.indexOf(mistake) != -1 && 
                        line.toLowerCase().indexOf('<meta') != -1;

              }

            );

            // sanity check
            if(!build) continue;

            // set the line
            current_last_line = build.subject

            // build the message
            var message       = '$';
            var identifiers   = [ mistake ]

            // if found
            if(mistake.suggestion) {

              message + ' did you perhaps mean $ ?'
              identifiers.push(mistake.suggestion);

            }

            // add it
            payload.addRule({

                key:          'description',
                message:      'Spelling mistake in document description',
                type:         'notice'

              }, {

                code:         build,
                display:      'code',
                message:      message,
                identifiers:  identifiers

              });

          }

          // done
          cb(null);

        });

    }, function() {

      // done
      fn(null);

    });

  });

};
