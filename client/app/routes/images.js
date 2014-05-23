export default Ember.Route.extend({
  model: function(){
    this.store.find('image');
  }
});
