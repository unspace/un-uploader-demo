export default Em.ObjectController.extend(Em.FSM.Stateful, {
  file:        null,
  xhr:         null,
  upload:      null,
  progress:    null,
  isProcessed: Em.computed.equal('model.state', 'processed'),
  hasUpload:   Em.computed.bool('upload'),

  actions: {
    startUpload: function() {
      this.sendStateEvent('upload');
    }
  },

  states: {
    initialState: 'waiting'
  },

  stateEvents: {
    upload: {
      transition: {
        doIf:   'hasUpload',
        from:   'waiting',
        to:     'uploading',
        action: 'performFileUpload',
        after:  'didPerformFileUpload'
      }
    },

    connect: {
      transition: {
        from:   'uploading',
        to:     'processing.connecting',
        action: 'connectToImageProcessing',
        after:  'didConnectToImageProcessing'
      }
    },

    connected: {
      transition: {
        from:   'processing.connecting',
        to:     'processing.listening',
        action: 'enqueueImageForProcessing'
      }
    },

    complete: {
      transition: {
        from:  'processing.listening',
        to:    'processed',
        after: 'didProcessImage'
      }
    }
  },

  performFileUpload: function() {
    var controller = this;
    var upload     = this.get('upload');
    var file       = this.get('file');
    var receivedPromise;
    var receivedResolver;
    var receivedRejector;

    receivedPromise = new Em.RSVP.Promise(function(resolve, reject) {
      receivedResolver = resolve;
      receivedRejector = reject;
    });

    this.set('receivedPromise', receivedPromise);

    return new Em.RSVP.Promise(function(resolve, reject) {
      Em.$.ajax(upload.url, {
        type:        'put',
        data:        file,
        crossDomain: true,
        processData: false,
        contentType: upload.mime,
        beforeSend:  null,
        headers: {
          'x-amz-acl': 'private'
        },

        // For a reason I'm not able to investigate at the moment, jqXHR always
        // rejects onload with the custom progress listener below.
        // TODO: Fix this so that it will work idiomatically.
        xhr: function() {
          var xhr = Em.$.ajaxSettings.xhr();

          controller.set('xhr', xhr.upload);

          xhr.upload.addEventListener('progress', function(event) {
            Em.run(function() {
              if (event.lengthComputable) {
                controller.set('progress', (event.loaded / event.total));
              }
            });
          });

          xhr.upload.addEventListener('load', function() {
            var http = this;

            Em.run(function() {
              resolve(http);
            });
          });

          xhr.addEventListener('load', function() {
            var http = this;

            Em.run(function() {
              if (http.status === 200) {
                receivedResolver(http);
              } else {
                receivedRejector(http);
              }
            });
          });

          xhr.upload.addEventListener('error', function() {
            var http = this;

            Em.run(function() {
              reject(http);
            });
          });

          return xhr;
        }
      });
    });
  },

  didPerformFileUpload: function() {
    this.sendStateEvent('connect');
  },

  connectToImageProcessing: function() {
    var channel = this.pusher.subscribe('images');
    var promise;

    this.set('channel', channel);

    promise = new Em.RSVP.Promise(function(resolve, reject) {
      channel.bind('pusher:subscription_succeeded', function() {
        Em.run(function() {
          resolve(channel);
        });
      });

      channel.bind('pusher:subscription_failed', function(err) {
        Em.run(function() {
          reject(err);
        });
      });
    });

    return promise;
  },

  didConnectToImageProcessing: function() {

  },

  enqueueImageForProcessing: function() {

  },

  didProcessImage: function() {

  },

  wholeProgress: function() {
    var progress = this.get('progress');

    if (Em.isNone(progress)) {
      return;
    }

    return Math.round(progress * 100);
  }.property('progress')
});
