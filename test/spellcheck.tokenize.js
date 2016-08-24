// modules
const assert      = require('assert');
const _           = require('underscore');
const fs          = require('fs');
const passmarked  = require('passmarked');
const spellCheck  = require('../lib/spellcheck');

// handle the settings
describe('spellchecking', function() { 

  describe('#tokenize', function() { 

    it('Should return [Gorilla, Store, SA] from "GorillaStoreSA"', function(done) {

      // run the rules
      var results = spellCheck.tokenize('GorillaStoreSA');
      
      if(results[0] != 'Gorilla') 
        assert.fail();
      if(results[1] != 'Store') 
        assert.fail();
      if(results[2] != 'SA') 
        assert.fail();

      if(results.length !== 3)
        assert.fail();

      done();

    });

    it('Should return [IT, Tech] from "ITTech"', function(done) {

      // run the rules
      var results = spellCheck.tokenize('ITTech');
      
      if(results[0] != 'IT') 
        assert.fail();
      if(results[1] != 'Tech') 
        assert.fail();

      if(results.length !== 2)
        assert.fail();

      done();

    });

    it('Should return [IT] from "IT"', function(done) {

      // run the rules
      var results = spellCheck.tokenize('IT');
      
      if(results[0] != 'IT') 
        assert.fail();

      if(results.length !== 1)
        assert.fail();

      done();

    });

    it('Should return [Tele,Comm] from "TeleComm"', function(done) {

      // run the rules
      var results = spellCheck.tokenize('TeleComm');
      
      if(results[0] != 'Tele') 
        assert.fail();
      if(results[1] != 'Comm') 
        assert.fail();

      if(results.length !== 2)
        assert.fail();

      done();

    });

    it('Should return [TELE,Comm] from "TELEComm"', function(done) {

      // run the rules
      var results = spellCheck.tokenize('TELEComm');
      
      if(results[0] != 'TELE') 
        assert.fail();
      if(results[1] != 'Comm') 
        assert.fail();

      if(results.length !== 2)
        assert.fail();

      done();

    });

    it('Should return [Frobnicate,The, BYTES] from "FrobnicateTheBYTES"', function(done) {

      // run the rules
      var results = spellCheck.tokenize('FrobnicateTheBYTES');
      
      if(results[0] != 'Frobnicate') 
        assert.fail();
      if(results[1] != 'The') 
        assert.fail();
      if(results[2] != 'BYTES') 
        assert.fail();

      if(results.length !== 3)
        assert.fail();

      done();

    });

    it('Should return [frobnicate] from "frobnicate"', function(done) {

      // run the rules
      var results = spellCheck.tokenize('frobnicate');
      
      if(results[0] != 'frobnicate') 
        assert.fail();

      if(results.length !== 1)
        assert.fail();

      done();

    });

  });

});