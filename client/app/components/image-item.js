export default Ember.Component.extend({
  classNames: ['image-item'],
  classNameBindings: ['image.currentState'],
  attributeBindings: ['style'],
  style: function() {
    return 'background-image: url("' + this.get('image.normalUrl') + '");';
  }.property('image.normalUrl')
});
