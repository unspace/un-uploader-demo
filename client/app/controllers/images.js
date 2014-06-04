export default Ember.ArrayController.extend({
  itemController: 'imageItem',

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
