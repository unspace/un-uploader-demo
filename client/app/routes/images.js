export default Ember.Route.extend({
  model: function() {
    return this.store.find('image');
  },

  afterModel: function() {
    var controller = this.controllerFor('images');
    var channel = this.pusher.subscribe('images');

    function bindEvent(event) {
      channel.bind(event, function(payload) {
        var item = controller.findBy('model.id', payload.image_id);

        if (item) {
          Em.sendEvent(item, event, [payload]);
        }
      });
    }

    controller.set('channel', channel);

    bindEvent('processing');
    bindEvent('processed');
    bindEvent('failed');
  }
});
