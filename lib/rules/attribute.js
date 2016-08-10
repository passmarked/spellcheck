// load in the modules
const url       = require('url');
const cheerio   = require('cheerio');
const S         = require('string');
const _         = require('underscore')

/**
* Loads the list of supported ISO languages
**/ 
languageStrs = require('../../languages.json')

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

    try {
      // get the page titles and create one content
      lang = $('html').attr('lang') || '';
    } catch(err) {
      console.dir(e);
    }

    // if this is empty put up a warning
    if(S(lang).isEmpty() == false) {

      /**

      // get the code
      var build = payload.getSnippetManager().build(lines, -1, '<html');

      // add the rule
      payload.addRule({

          type:           'notice',
          message:        'Document missing a language attribute',
          key:            'language.attribute'

        }, {

            display:      'code',
            code:         build,
            message:      '$ attribute missing on $ element',
            identifiers:  [

              'lang',
              'html'

            ]

          });
      **/

    } else {

      // get the language
      var language = _.find(languageStrs, function(language) {

        // check if the lang is actually defined
        if(!language)       return false;
        if(!language.code)  return false;

        // get the iso short
        var code = (lang || '').toLowerCase().split('-')[0];

        // return the final check
        return (lang.code || '').toLowerCase().indexOf(code) == 0;

      });

      // if we din't find it, report it ...
      if(!language) {

        // get the code
        var build = payload.getSnippetManager().build(lines, -1, '<html')

        // add our rule
        payload.addRule({

            type:           'error',
            message:        'Unknown language specified in lang attribute',
            key:            'language.unknown'

          }, {

              display:      'code',
              code: build,
              message:      '$ is not a valid ISO Language Code',
              identifiers:  [

                (lang || '').toLowerCase()

              ]

            });

      }

    }

    // done
    fn(null)

  });

};
