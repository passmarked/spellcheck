// load in the modules
const url           = require('url');
const cheerio       = require('cheerio');
const S             = require('string');
const _             = require('underscore')
const SpellCheck    = require('../spellcheck');

/**
* expose our function
**/
module.exports = exports = function(payload, fn) {

  // get the data
  var data = payload.getData();

  // parse the url 
  var uri = url.parse(data.url);

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

    // load up cheerio
    var $ = cheerio.load(content || '');

    // get the line strs
    var lines = content.split('\n');

    // load html
    var $ = cheerio.load(content || '');

    // default lang str
    var lang = null;

    // get the page titles and create one content
    try {
      lang = $('html').attr('lang') || null;
    } catch(err) {
      payload.error('Attribute', 'Problem checking the language attribute on page', err);
    }

    // if this is empty put up a warning
    if(lang !== null && 
        S(lang || '').isEmpty() === false) {

      // get the languages
      SpellCheck.getLanguage(lang, function(err, languages) {

        // if we did not find it, report it ...
        if((languages || []).length === 0) {

          // get the code
          var build = payload.getSnippetManager().build(lines, -1, '<html')

          // add our rule
          payload.addRule({

              type:           'error',
              message:        'Unknown language specified in lang attribute',
              key:            'unknown'

            }, {

              display:        'code',
              code:           build,
              message:        '$ is not a known language code',
              identifiers:    [

                (lang || '').toLowerCase()

              ]

            });

        }

        // done
        fn(null);

      });

    } else {

      // done
      fn(null)

    }

  });

};
