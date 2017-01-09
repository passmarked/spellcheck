// load in the modules
const url           = require('url');
const cheerio       = require('cheerio');
const S             = require('string');
const async         = require('async');
const spellCheck    = require('../spellcheck')

/**
* List of the body tags
**/
var elementTags = [

  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'li',
  'a'

];

/**
* expose our function
**/
module.exports = exports = function(payload, fn) {

  // get the data
  var data  = payload.getData();

  // parse the url 
  var uri   = url.parse(data.url)

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
    var lang = null

    // the language must be set
    if(S($('html').attr('lang') || '').isEmpty() === false)
      lang = $('html').attr('lang') || null;

    // get tlines
    var lines = content.split('\n');

    // get the text lines
    var spellingTexts = [];

    // create a list of tags to use
    for(var i = 0; i < elementTags.length; i++) {

      // loop it all
      $('body ' + elementTags[i]).each(function(index, elem) {

        // push the item
        spellingTexts.push(spellCheck.trim( $(elem).contents().filter(function() {
            
          // return only the text
          return this.type === 'text';

        }).text() ));

      });

    }

    console.dir(spellingTexts)

    // get the content
    spellCheck.check({

        content:    spellingTexts.slice(0, 500),
        keywords:   [ uri.hostname ].concat(data.keywords || []),
        language:   lang,
        payload:    payload

      }, function(err, mistakes) {

        // did we have any error ?
        if(err) {

          // debug
          payload.error('Something went wrong getting mistakes from ASPELL', err);

          // try again
          return fn(null);

        } 

        // add a rule if we have any
        if((mistakes || []).length === 0) return fn(null);

        // keep track of the last line
        var current_last_line       = -1
        var current_txt_last_line   = -1;

        // get the min counters for each mistake
        var minMistakes = {};

        // loop the mistakes
        for(var i = 0; i < mistakes.length; i++) {

          // local reference
          var mistake = mistakes[i];

          // get the code
          var build = payload.getSnippetManager().build(

            lines,
            minMistakes[mistake.word] || -1,
            function(line) {

              return line.toLowerCase().indexOf('<' + elementTags[i]) != -1 && 
                      line.toLowerCase().indexOf(mistake.word.toLowerCase()) != -1;

            }

          );

          // sanity check
          if(!build) continue;

          // set the line
          minMistakes[mistake.word] = build.subject;

          // build the message
          var instance_message = '$ was not recognised';
          var identifiers_strs = [ mistake.word ];

          // check if the token is defined
          if(mistake.token) {

            instance_message = '$ in $ was not recognised';
            identifiers_strs = [ mistake.token, mistake.word ];

          }

          // add it
          payload.addRule({

              key:        'body',
              message:    'Spelling mistake found in page body',
              type:       'warning'

            }, {

              code:         build,
              display:      'code',
              message:      instance_message,
              identifiers:  identifiers_strs,
              tools:        ['dictionary.add']

            })

        }
        
        // loop all the titles .. ? YOu should actually only have one
        fn(null)

    });

  });

};
