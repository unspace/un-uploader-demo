export default Ember.ArrayController.extend({
  itemController: 'imageItem',

  newest: Ember.computed.sort('@this.@each.sequence', function(a, b) {
    var aSeq = a.get('sequence');
    var bSeq = b.get('sequence');

    if (aSeq > bSeq) {
      return -1;
    } else if (aSeq < bSeq) {
      return 1;
    } else {
      return 0;
    }
  }),

  actions: {
    addFiles: function(files) {
      files.forEach(function(file, i) {
        var image = this.store.createRecord('image');
        var seq   = new Date().valueOf() + i;
        var item;

        this.pushObject(image);

        item = this.get('lastObject');
        item.set('file', file);
        item.set('sequence', seq);
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
