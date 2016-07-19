// modules
const assert      = require('assert');
const _           = require('underscore');
const fs          = require('fs');
const passmarked  = require('passmarked');
const spellCheck  = require('../lib/spellcheck');

// handle the settings
describe('spellchecking', function() { 

  describe('#getLanguages', function() { 

    // handle the error output
    it('Should report back the full list of dictionaries', function(done) {

      // run the rules
      spellCheck.getLanguages(function(err, languages) {

        if(err) assert.fail('Spellcheck function returned a error')

        // must have a array with items returned
        if(languages.length == 0) assert.fail('Was expecting a array of languages');

        // done
        done();

      });

    });

  });
  
  return;

  // handle the error output
  it('should not report a spelling mistake', function(done) {

    // read in the html sample
    var content = fs.readFileSync('./samples/spellcheck.right.txt').toString();

    // run the rules
    testFunc({ content: text_content.toString() } , function(err, mistakes) {

      // check if defined
      if(err) assert.fail('Spellcheck function returned a error')
      if(!mistakes) assert.fail('Spelling mistakes returned was null/undefined')

      // must be 0
      if(mistakes.length > 0)
        assert.fail('was not expecting a spellcheck from correct spelling sample file');

      // done
      done()

    });

  });

  // handle the error output
  it('should report a few spelling mistakes', function(done) {

    // read in the html sample
    var content = fs.readFileSync('./samples/spellcheck.wrong.txt').toString();

    // run the rules
    testFunc({ content: text_content.toString() } , function(err, mistakes) {

      // check if defined
      if(err) assert.fail('Spellcheck function returned a error')
      if(!mistakes) assert.fail('Spelling mistakes returned was null/undefined')

      // must be 0
      if(spelling_mistake_strs.length === 0)
        assert.fail('was a expecting a few errors to be returned ...')

      // done
      done()

    });

  });

});







