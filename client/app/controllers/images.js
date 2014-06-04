export default Ember.ArrayController.extend({
  itemController: 'imageItem',

  bindEvent: function (event) {
    var _this = this;
    this.get('channel').bind(event, function(payload) {
      Ember.run(function() {
        var item = _this.findBy('id', payload.image_id);

        if (item) {
          Ember.sendEvent(item, event, [payload]);
        } else if (event === 'processed') {
          _this.insertAt(0, _this.store.find('image', payload.image_id));
        }
      });
    });
  },

  _subscribePusher: function(){
    var channel = this.pusher.subscribe('images');

    this.set('channel', channel);

    this.bindEvent('processing');
    this.bindEvent('processed');
    this.bindEvent('failed');
  }.on('init'),

  actions: {
    addFiles: function(files) {
      files.forEach(function(file) {
        var image;
        var item;

        image = this.store.createRecord('image');
        this.insertAt(0, image);
        item = this.get('firstObject');
        item.set('file', file);
        item.send('startUpload');
      }, this);
    }
  }
});
