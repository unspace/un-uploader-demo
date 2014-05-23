var Router = Ember.Router.extend({
  location: ENV.locationType
});

Router.map(function() {
  this.resource('images');
});

export default Router;
