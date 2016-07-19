# @passmarked/spellcheck 

![NPM](https://img.shields.io/npm/dt/@passmarked/spellcheck.svg) [![Build Status](https://travis-ci.org/passmarked/spellcheck.svg)](https://travis-ci.org/passmarked/spellcheck)

[Passmarked](http://passmarked.com) is a suite of tests that can be run against any page/website to identify issues with parity to most online tools in one package.

The [Terminal Client](http://npmjs.org/package/passmarked) is intended for use by developers to integrate into their workflow/CI servers but also integrate into their own application that might need to test websites and provide realtime feedback.

All of the checks on [Passmarked](http://passmarked.com) can be voted on importance and are [open-sourced](http://github.com/passmarked/suite), to encourage community involvement in fixing and adding new rules. We are building the living Web Standard and love any [contributions](#contributing).

## Synopsis

The module firstly checks if any language tag is present, if none presents a rule and skips the actual checking. If the language tag is present, the chosen dictionary is loaded and checked.

The rules checked in this module are:

* **language.attribute** - No language attribute was provided.
* **language.unknown** - The given language was not in the list of valid BCP 47 language tags.
* **title** - Mistake found in the title of page
* **description** - Mistake found in description of the page
* **keywords** - Mistake found in page keywords
* **body** - Mistake found in body of the page from elements h1,h2,h3,h4,h5,h6,p,li,a

## Running

The rules are checked everytime a url is run through Passmarked or our API. To run using the hosted system head to [passmarked.com](http://passmarked.com) or our [Terminal Client](http://npmjs.org/package/passmarked) use:

```bash
npm install -g passmarked
passmarked --filter=spellcheck example.com
```

The hosted version allows free runs from our homepage and the option to register a site to check in its entirety.
Using the Passmarked npm module (or directly via the API) integrations are also possible to get running reports with all the rules in a matter of seconds.

## Running Locally

All rules can be run locally using our main integration library. This requires installing the package and any dependencies that the code might have such as a specific version of OpenSSL, see [#dependencies](#dependencies)

First ensure `passmarked` is installed:

```bash
npm install passmarked
npm install @passmarked/spellcheck
```

After which the rules will be runnable using promises:

```javascript
passmarked.createRunner(
  require('@passmarked/spellcheck'), // this package
  require('@passmarked/ssl') // to test SSL
).run({
  url: 'http://example.com',
  body: 'body of page here',
  har: {log: {entries: []}}
}).then(function(payload) {
  if (payload.hasRule('secure')) {
    console.log('better check that ...');
  }
  var rules = payload.getRules();
  for (var rule in rules) {
    console.log('*', rules[rule].getMessage());
  }
}).catch(console.error.bind(console));
```

Alternatively, callbacks are also available:

```javascript
passmarked.createRunner(
  require('@passmarked/spellcheck'),
  require('@passmarked/ssl'),
  require('@passmarked/inspect')
).run({
  url: 'http://example.com',
  body: 'body of page here',
  har: {log: {entries: []}}
}, function(err, payload) {
  if (payload.hasRule('secure')) {
    console.log("better check that ...");
  }
  var rules = payload.getRules();
  for (var rule in rules) {
    console.log('*', rules[rule].getMessage());
  }
});
```

## Dependencies

The module pulls all available dictionaries from the system that are myspell/hunspell compatible. The module also calls the native module of hunspell to handle parsing and validating the words/grammer given.

For the basics the following must be installed, this will only check the default language on the system:

```bash
apt-get install -y aspell hunspell
```

Additional languages can then be added by installing the preferred dictionary, these dictionaries only need to be myspell/hunspell compatible. The Debian/Ubuntu apt repo already contains numerous dictionaries ready for use. 

Feel free to install of the following for example:

```bash
apt-get install -y hunspell-an
apt-get install -y hunspell-de-de
apt-get install -y hunspell-fr
apt-get install -y hunspell-fr-comprehensive
apt-get install -y hunspell-ar
apt-get install -y hunspell-ru
apt-get install -y hunspell-be
apt-get install -y hunspell-se
apt-get install -y hunspell-br
apt-get install -y hunspell-en-ca
apt-get install -y hunspell-en-med
apt-get install -y hunspell-en-us
apt-get install -y hunspell-eu-es
apt-get install -y hunspell-gl-es
apt-get install -y hunspell-sh
apt-get install -y hunspell-da
apt-get install -y hunspell-hu
apt-get install -y hunspell-kk
apt-get install -y hunspell-ko
apt-get install -y hunspell-de-ch
apt-get install -y hunspell-ml
apt-get install -y hunspell-uz
apt-get install -y hunspell-ne
apt-get install -y hunspell-vi

apt-get install -y myspell-af
apt-get install -y myspell-en-us
apt-get install -y myspell-en-za
apt-get install -y myspell-he
apt-get install -y myspell-ns
apt-get install -y myspell-th
apt-get install -y myspell-hr
apt-get install -y myspell-pl
apt-get install -y myspell-tl
apt-get install -y myspell-ca
apt-get install -y myspell-eo
apt-get install -y myspell-hu
apt-get install -y myspell-pt
apt-get install -y myspell-tn
apt-get install -y myspell-cs
apt-get install -y myspell-es
apt-get install -y myspell-hy
apt-get install -y myspell-pt-br
apt-get install -y myspell-da
apt-get install -y myspell-et
apt-get install -y myspell-it
apt-get install -y myspell-ts
apt-get install -y myspell-ru
apt-get install -y myspell-uk
apt-get install -y myspell-sk
apt-get install -y myspell-uk
apt-get install -y myspell-ga
apt-get install -y myspell-nl
apt-get install -y myspell-en-au
apt-get install -y myspell-en-gb
apt-get install -y myspell-nl
apt-get install -y myspell-nr
apt-get install -y myspell-sw
```

## Rules

Rules represent checks that occur in this module, all of these rules have a **UID** which can be used to check for specific rules. For the structure and more details see the [Wiki](https://github.com/passmarked/passmarked/wiki) page on [Rules](https://github.com/passmarked/passmarked/wiki/Create).

> Rules also include a `type` which could be `critical`, `error`, `warning` or `notice` giving a better view on the importance of the rule.

## Contributing

```bash
git clone git@github.com:passmarked/spellcheck.git
npm install
npm test
```

Pull requests have a prerequisite of passing tests. If your contribution is accepted, it will be merged into `develop` (and then `master` after staging tests by the team) which will then be deployed live to [passmarked.com](http://passmarked.com) and on NPM for everyone to download and test.

## About

To learn more visit:

* [Passmarked](http://passmarked.com)
* [Terminal Client](https://www.npmjs.com/package/passmarked)
* [NPM Package](https://www.npmjs.com/package/@passmarked/spellcheck)
* [Slack](http://passmarked.com/chat) - We have a Slack team with all our team and open to anyone using the site to chat and figure out problems. To join head over to [passmarked.com/chat](http://passmarked.com/chat) and request a invite.

## License

Copyright 2016 Passmarked Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.