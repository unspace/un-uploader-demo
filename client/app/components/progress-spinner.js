var SPINNER_PROPS = [
  'lines',
  'length',
  'width',
  'radius',
  'corners',
  'rotate',
  'direction',
  'color',
  'speed',
  'trail',
  'shadow',
  'hwaccel',
  'className',
  'zIndex',
  'top',
  'left'
];

export default Ember.Component.extend({
  lines: 13,            // The number of lines to draw
  length: 9,            // The length of each line
  width: 4,             // The line thickness
  radius: 11,           // The radius of the inner circle
  corners: 1,           // Corner roundness (0..1)
  rotate: 0,            // The rotation offset
  direction: 1,         // 1: clockwise, -1: counterclockwise
  color: '#999',        // #rgb or #rrggbb or array of colors
  speed: 1,             // Rounds per second
  trail: 60,            // Afterglow percentage
  shadow: false,        // Whether to render a shadow
  hwaccel: false,       // Whether to use hardware acceleration
  className: 'progress-spinner', // The CSS class to assign to the spinner
  zIndex: 2e9,          // The z-index (defaults to 2000000000)
  top: '50%',           // Top position relative to parent
  left: '50%',          // Left position relative to parent
  classNames: 'progress-spinner-container',

  didInsertElement: function() {
    var opts = this.getProperties(SPINNER_PROPS);
    this._spinner = new Spinner(opts).spin(this.get('element'));
  },

  willDestroy: function() {
    this._spinner.stop();
  }
});
