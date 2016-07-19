// modules
const assert      = require('assert');
const _           = require('underscore');
const fs          = require('fs');
const passmarked  = require('passmarked');
const spellCheck  = require('../lib/spellcheck');

// handle the settings
describe('spellchecking', function() { 

  describe('#getLanguage', function() { 

    it('Should return the en_US language if requested using correct casing', function(done) {

      // run the rules
      spellCheck.getLanguage('en_US', function(err, language) {

        if(err) assert.fail('Spellcheck function returned a error')

        if(!language) assert.fail('No language was returned');

        // done
        done();

      });

    });

    it('Should return the en_US language if requested using a incorrect casing', function(done) {

      // run the rules
      spellCheck.getLanguage('en_us', function(err, language) {

        if(err) assert.fail('Spellcheck function returned a error')

        if(!language) assert.fail('No language was returned');

        // done
        done();

      });

    });

    it('Should return a empty array if the language was not found', function(done) {

      // run the rules
      spellCheck.getLanguage('en_us' + new Date().getTime(), function(err, dicts) {

        if(err) assert.fail('Spellcheck function returned a error')

        if(dicts.length != 0) assert.fail('Was expecting a blank array  to be returned');

        // done
        done();

      });

    });

  });

});







