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
    it('should not return the error if the mistake is contained in keyword', function(done) {

      // read in the html sample
      var content = fs.readFileSync('./samples/spellcheck.wrong.txt').toString('utf8');

      // handle the payload
      var payload = passmarked.createPayload({

        url: 'https://example.com'

      }, null, content.toString())

      // run the rules
      spellCheck.check({ 

        content:    content.split('\n'),
        language:   'en',
        keywords:   [ 'blokshouldskip.com' ],
        payload:    payload

      } , function(err, mistakes) {

        // check if defined
        if(err) assert.fail('Spellcheck function returned a error')
        if(!mistakes) assert.fail('Spelling mistakes returned was null/undefined')

        // get the find
        var spellingCheck = _.find(mistakes || [], function(item) {

          return item.word === 'blok';

        });

        if(spellingCheck) {

          // fail
          assert.fail('Should not report the error');

        }

        // get the find
        var spellingChecker = _.find(mistakes || [], function(item) {

          return item.word === 'tht';

        });

        if(!spellingChecker) {

          // fail
          assert.fail('Should still report the *tht* mistake as a error');

        }

        // done
        done()

      });

    });

    // handle the error output
    it('should not return the error if is fully in the list of keywords', function(done) {

      // read in the html sample
      var content = fs.readFileSync('./samples/spellcheck.wrong.txt').toString('utf8');

      // handle the payload
      var payload = passmarked.createPayload({

        url: 'https://example.com'

      }, null, content.toString())

      // run the rules
      spellCheck.check({ 

        content:    content.split('\n'),
        language:   'en',
        keywords:   [ 'tht' ],
        payload:    payload

      } , function(err, mistakes) {

        // check if defined
        if(err) assert.fail('Spellcheck function returned a error')
        if(!mistakes) assert.fail('Spelling mistakes returned was null/undefined')

        // get the find
        var spellingCheck = _.find(mistakes || [], function(item) {

          return item.word === 'blok';

        });

        if(!spellingCheck) {

          // fail
          assert.fail('Should still give *blok* the error');

        }

        // get the find
        var spellingChecker = _.find(mistakes || [], function(item) {

          return item.word === 'tht';

        });

        if(spellingChecker) {

          // fail
          assert.fail('Should not report the *tht* mistake as a error');

        }

        // done
        done()

      });

    });

    // handle the error output
    it('should not return the error if is fully in the list of keywords', function(done) {

      // read in the html sample
      var content = fs.readFileSync('./samples/spellcheck.wrong.txt').toString('utf8');

      // handle the payload
      var payload = passmarked.createPayload({

        url: 'https://example.com'

      }, null, content.toString())

      // run the rules
      spellCheck.check({ 

        content:    content.split('\n'),
        language:   'en',
        keywords:   [ 'blok' ],
        payload:    payload

      } , function(err, mistakes) {

        // check if defined
        if(err) assert.fail('Spellcheck function returned a error')
        if(!mistakes) assert.fail('Spelling mistakes returned was null/undefined')

        // get the find
        var spellingCheck = _.find(mistakes || [], function(item) {

          return item.word === 'blok';

        });

        if(spellingCheck) {

          // fail
          assert.fail('Should not report the *blok* mistake as a error');

        }

        // get the find
        var spellingChecker = _.find(mistakes || [], function(item) {

          return item.word === 'tht';

        });

        if(!spellingChecker) {

          // fail
          assert.fail('Should still give *tht* the error');

        }

        // done
        done()

      });

    });

    // handle the error output
    it('should not report a spelling mistake', function(done) {

      // read in the html sample
      var content = fs.readFileSync('./samples/spellcheck.right.txt').toString('utf8');

      // handle the payload
      var payload = passmarked.createPayload({

        url: 'https://example.com'

      }, null, content.toString())

      // run the rules
      spellCheck.check({ 

        content:    content.split('\n'),
        language:   'en',
        keywords:   [],
        payload:    payload

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

      // handle the payload
      var payload = passmarked.createPayload({

        url: 'https://example.com'

      }, null, content.toString())

      // run the rules
      spellCheck.check({ 

        content:    content.split('\n'),
        language:   'en',
        keywords:   [],
        payload:    payload

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

      // handle the payload
      var payload = passmarked.createPayload({

        url: 'https://example.com'

      }, null, content.toString())

      // run the rules
      spellCheck.check({ 

        content:    content.split('\n'),
        language:   'en',
        keywords:   [],
        payload:    payload

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
