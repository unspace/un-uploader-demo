export default Ember.ArrayController.extend({
  itemController: 'imageItem',

  _subscribePusher: function(){
    var _this = this;
    var channel = this.pusher.subscribe('images');

    function bindEvent(event) {
      channel.bind(event, function(payload) {
        var item = _this.findBy('id', payload.image_id);

        if (item) {
          Ember.sendEvent(item, event, [payload]);
        } else if (event === 'processed') {
          _this.insertAt(0, _this.store.find('image', payload.image_id));
        }
      });
    }

    this.set('channel', channel);

    bindEvent('processing');
    bindEvent('processed');
    bindEvent('failed');
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
