// modules
const assert      = require('assert');
const _           = require('underscore');
const fs          = require('fs');
const passmarked  = require('passmarked');
const spellCheck  = require('../lib/spellcheck');

// handle the settings
describe('spellchecking', function() { 

  describe('#check', function() { 

    // handle the error output
    it('should not report a spelling mistake', function(done) {

      // read in the html sample
      var content = fs.readFileSync('./samples/spellcheck.right.txt').toString('utf8');

      // run the rules
      spellCheck.check({ 

        content:    content.split('\n'),
        language:   'en',
        keywords:   []

      } , function(err, mistakes) {

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
    it('should not report a spelling mistake on big dataset', function(done) {

      // read in the html sample
      var content = fs.readFileSync('./samples/spellcheck.big.txt').toString('utf8');

      // run the rules
      spellCheck.check({ 

        content:    content.split('\n'),
        language:   'en',
        keywords:   []

      } , function(err, mistakes) {

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
    it('should report a spelling mistake', function(done) {

      // read in the html sample
      var content = fs.readFileSync('./samples/spellcheck.wrong.txt').toString('utf8');

      // run the rules
      spellCheck.check({ 

        content:    content.split('\n'),
        language:   'en',
        keywords:   []

      } , function(err, mistakes) {

        // check if defined
        if(err) assert.fail('Spellcheck function returned a error')
        if(!mistakes) assert.fail('Spelling mistakes returned was null/undefined')

        // must be 0
        if(mistakes.length == 0)
          assert.fail('was expecting a spellcheck from correct spelling sample file');

        // done
        done()

      });

    });

  });

});
