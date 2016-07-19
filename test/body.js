// modules
const assert        = require('assert');
const _             = require('underscore');
const fs            = require('fs');
const passmarked    = require('passmarked');
const testFunc      = require('../lib/rules/body');

describe('body', function() {

  // handle the error output
  it('should report a error for the sample page as there is a spelling mistake', function(done) {

    // read in the html sample
    var content = fs.readFileSync('./samples/body.wrong.html').toString();

    // handle the payload
    var payload = passmarked.createPayload({

      url: 'https://example.com'

    }, null, content.toString())

    // run the method
    testFunc(payload, function(err) {

      // check for a error
      if(err) assert.fail('Did not expect a error ...')

      // get the rules
      var rules = payload.getRules();

      // check
      var rule = _.find(
        rules, 
        function(item) { return item.key == 'body'; }
      );

      // check if we found it
      if(!rule)
        assert.fail('Was expecting a error')

      // done
      done()

    });

  });

  // handle the error output
  it('should not report a error on correct body', function(done) {

    // read in the html sample
    var content = fs.readFileSync('./samples/body.right.html').toString();

    // handle the payload
    var payload = passmarked.createPayload({

      url: 'https://example.com'

    }, null, content.toString())

    // run the method
    testFunc(payload, function(err) {

      // check for a error
      if(err) assert.fail('Did not expect a error ...')

      // get the rules
      var rules = payload.getRules();

      // check
      var rule = _.find(
        rules, 
        function(item) { return item.key == 'body'; }
      );

      // check if we found it
      if(rule)
        assert.fail('Was not expecting a error')

      // done
      done()

    });

  });

});
