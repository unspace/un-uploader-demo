export default Ember.Component.extend({
  classNames: ['progress-bar'],
  attributeBindings: ['style'],
  style: function() {
    return 'width: ' + this.get('progress') + '%;';
  }.property('progress')
});
