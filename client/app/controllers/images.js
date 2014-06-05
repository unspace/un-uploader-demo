export default Ember.ArrayController.extend({
  itemController: 'imageItem',

  newest: Ember.computed.sort('@this.@each.createdAt', function(a, b) {
    var dateA = a.get('createdAt').valueOf();
    var dateB = b.get('createdAt').valueOf();

    if (dateA > dateB) {
      return -1;
    } else if (dateA < dateB) {
      return 1;
    } else {
      return 0;
    }
  }),

  actions: {
    addFiles: function(files) {
      files.forEach(function(file, i) {
        var now   = new Date();
        var image = this.store.createRecord('image', { createdAt: now });
        var item;

        this.pushObject(image);

        item = this.get('lastObject');
        item.set('file', file);
        item.send('startUpload');
      }, this);
    },

    removeItem: function(item) {
      item.unloadRecord();
      this.removeObject(item);
    }
  },

  _bindEvent: function(event, after) {
    var controller = this;
    var channel    = this.get('channel');

    channel.bind(event, function(payload) {
      Ember.run(function() {
        var item = controller.findBy('id', payload.image_id);

        if (item) {
          Ember.sendEvent(item, event, [payload]);
        }

        if (after) {
          after.call(controller, payload);
        }
      });
    });
  },

  _subscribePusher: function() {
    this.set('channel', this.pusher.subscribe('images'));

    this._bindEvent('processing');
    this._bindEvent('failed');
    this._bindEvent('processed', function(payload) {
      this.store.find('image', payload.image_id);
    });
  }.on('init')
});
