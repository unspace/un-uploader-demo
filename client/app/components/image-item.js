export default Ember.Component.extend({
  classNames: 'image-item',
  classNameBindings: 'image.currentState',
  attributeBindings: 'style',

  style: function() {
    var url = this.get('image.normalUrl');

    if (url) {
      return 'background-image: url("' + url + '");';
    } else {
      return null;
    }
  }.property('image.normalUrl')
});
