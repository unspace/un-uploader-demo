export default Em.Component.extend({
  classNames: 'un-uploader',
  label:      'Choose Files',
  disabled:   false,
  multiple:   true,

  didSelect: function(list) {
    var files;

    if (this.get('multiple')) {
      files = [];

      for (var i = 0; i < list.length; i++) {
        files.push(list.item(i));
      }

      this.sendAction('selected', files);
    } else {
      this.sendAction('selected', list.item(0));
    }
  },

  didInsertElement: function() {
    var component = this;

    this.$('input[type="file"]').on('change', function(event) {
      Em.run(function() {
        component.didSelect(event.target.files);
      });
    });
  },

  willDestroyElement: function() {
    this.$('input[type="file"]').off('change');
  }
});
