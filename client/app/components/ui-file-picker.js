export default Ember.Component.extend({
  classNames:         ['ui-file-picker'],
  classNameBindings:  ['disabled'],
  label:              'Choose Files',
  disabled:           false,
  multiple:           true,

  inputId: function() {
    return 'file-input-' + this.get('elementId');
  }.property('elementId'),

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
      Ember.run(function() {
        component.didSelect(event.target.files);
      });
    });
  },

  willDestroyElement: function() {
    this.$('input[type="file"]').off('change');
  }
});
