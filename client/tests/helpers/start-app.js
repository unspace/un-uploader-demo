/* global require */

var Application = require('uploader-client/app')['default'];
var Router = require('uploader-client/router')['default'];

import { request } from 'ic-ajax';

Ember.Application.initializer({
  name: 'ic-ajax_ED',
  after: 'store',
  initialize: function(container, application){
      DS.ActiveModelAdapter.reopen({
        ajax: function(url, type, options){
          options = this.ajaxOptions(url, type, options);
          return request(options);
        }
      });
  }
});

export default function startApp(attrs) {
  var App;

  var attributes = Ember.merge({
    // useful Test defaults
    rootElement: '#ember-testing',
    LOG_ACTIVE_GENERATION:false,
    LOG_VIEW_LOOKUPS: false
  }, attrs); // but you can override;

  Router.reopen({
    location: 'none'
  });

  Ember.run(function(){
    App = Application.create(attributes);
    App.setupForTesting();
    App.injectTestHelpers();
  });

  App.reset(); // this shouldn't be needed, i want to be able to "start an app at a specific URL"

  return App;
}
