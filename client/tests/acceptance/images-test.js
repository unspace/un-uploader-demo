import startApp from '../helpers/start-app';
import { defineFixture } from 'ic-ajax';

defineFixture('/api/images', {
  response: {"images": []},
  textStatus: 'success'
});

var App;

var indexUrl = '/images';

module('Acceptances - Dataset', {
  setup: function() {
    App = startApp();
    visit(indexUrl);
  },

  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("Shows the file-picker", function(){
  expect(1);
  var button = find('.file-picker');
  equal(button.length, 1, 'no file-picker button');
});
