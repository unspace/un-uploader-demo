export default {
  name: 'pusher',

  initialize: function(container, app) {
    var pusher = new Pusher(ENV.PUSHER_APP_KEY);
    app.register('pusher:main', pusher, { instantiate: false });
    app.inject('route', 'pusher', 'pusher:main');
  }
};
