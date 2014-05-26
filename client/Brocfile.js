/* global require, module */
var replace = require('broccoli-replace');
var fingerprint = require('broccoli-fingerprint');
var fs = require('fs');
var path = require('path');

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp({
  name: require('./package.json').name,

  minifyCSS: {
    enabled: true,
    options: {}
  },

  getEnvJSON: require('./config/environment')
});

// Use this to add additional libraries to the generated output files.
app.import('vendor/ember-data/ember-data.js');

// If the library that you are including contains AMD or ES6 modules that
// you would like to import into your application please specify an
// object with the list of modules as keys along with the exports of each
// module as its value.
app.import('vendor/ic-ajax/dist/named-amd/main.js', {
  'ic-ajax': [
    'default',
    'defineFixture',
    'lookupFixture',
    'raw',
    'request',
  ]
});

var tree = app.toTree();

// fingerprint assets for production
// this code is a WIP and should be improbed/handled by ember-cli
if(process.env.EMBER_ENV == 'production'){
  tree = fingerprint(tree, {
    encoding:'utf8'
    , separator: '-'
    , keepOriginal: false
    , extensions: ['js', 'css']
  });

  tree = replace(tree, {
    files: [
    'index.html'
    ],
    patterns: [{
      match: /uploader-client.js/g,
      replacement: function(){
        var dir = fs.readdirSync(tree.inputTree.tmpDestDir + "/assets");
        dir = dir.filter(function(e){
          return e.match(/uploader-client-.*\.js/);
        });
        return dir[0];
      }
    },
    {
      match: /uploader-client.css/g,
      replacement: function(){
        var dir = fs.readdirSync(tree.inputTree.tmpDestDir + "/assets");
        dir = dir.filter(function(e){
          return e.match(/uploader-client-.*\.css/);
        });
        return dir[0];
      }
    },
    {
      match: /vendor.css/g,
      replacement: function(){
        var dir = fs.readdirSync(tree.inputTree.tmpDestDir + "/assets");
        dir = dir.filter(function(e){
          return e.match(/vendor-.*\.css/);
        });
        return dir[0];
      }
    }]
  });
}

module.exports = tree;
