import { request } from 'ic-ajax';

export default Ember.ObjectController.extend(Ember.FSM.Stateful, {
  file:            null,
  xhr:             null,
  upload:          null,
  progress:        null,
  receivedPromise: null,
  error:           null,
  hasUpload:       Ember.computed.bool('upload'),
  hasFile:         Ember.computed.bool('file'),

  wholeProgress: function() {
    var progress = this.get('progress');

    if (Ember.isNone(progress)) {
      return;
    }

    return Math.round(progress * 100);
  }.property('progress'),

  actions: {
    startUpload: function() {
      if (this.get('hasFile')) {
        this.sendStateEvent('start');
      }
    }
  },

  stateEvents: {
    start: {
      transition: { initialized: 'signing',
        doIf:   'hasFile',
        action: 'getSignedUpload',
        after:  'didGetSignedUpload'
      }
    },

    upload: {
      transition: { signing: 'uploading',
        doIf:   'hasUpload',
        action: 'performFileUpload',
        after:  'didPerformFileUpload'
      }
    },

    process: {
      transition: { uploading: 'processing',
        action: 'enqueueImageForProcessing'
      }
    },

    complete: {
      transition: { processing: 'processed',
        after: 'didComplete'
      }
    },

    error: {
      transitions: [
        { signing:    'failed', after: 'didFailSigning' },
        { processing: 'failed', after: 'didFailProcessing' },
        { $any:       'failed' }
      ]
    }
  },

  getSignedUpload: function() {
    var xhr;
    var file       = this.get('file');
    var model      = this.get('model');
    var controller = this;

    xhr = request('/api/uploads', {
      type: 'post',
      data: { upload: { file_name: file.name } }
    });

    xhr.then(
      function(payload) {
        model.set('id', payload.upload.id);
        controller.set('upload', payload.upload);
      }
    );

    return xhr;
  },

  didGetSignedUpload: function() {
    this.sendStateEvent('upload');
  },

  performFileUpload: function() {
    var controller = this;
    var upload     = this.get('upload');
    var file       = this.get('file');
    var receivedPromise;
    var receivedResolver;
    var receivedRejector;

    receivedPromise = new Ember.RSVP.Promise(function(resolve, reject) {
      receivedResolver = resolve;
      receivedRejector = reject;
    });

    this.set('receivedPromise', receivedPromise);

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(upload.url, {
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
          var xhr = Ember.$.ajaxSettings.xhr();

          controller.set('xhr', xhr.upload);

          xhr.upload.addEventListener('progress', function(event) {
            Ember.run(function() {
              if (event.lengthComputable) {
                controller.set('progress', (event.loaded / event.total));
              }
            });
          });

          xhr.upload.addEventListener('load', function() {
            var http = this;

            Ember.run(function() {
              resolve(http);
            });
          });

          xhr.addEventListener('load', function() {
            var http = this;

            Ember.run(function() {
              if (http.status === 200) {
                receivedResolver(http);
              } else {
                receivedRejector(http);
              }
            });
          });

          xhr.upload.addEventListener('error', function() {
            var http = this;

            Ember.run(function() {
              reject(http);
            });
          });

          return xhr;
        }
      });
    });
  },

  didPerformFileUpload: function() {
    this.sendStateEvent('process');
  },

  enqueueImageForProcessing: function() {
    var image  = this.get('model');
    var upload = this.get('upload');

    image.set('uploadKey', upload.key);

    return image.save();
  },

  didComplete: function() {
    this.reset();
    this.get('model').reload();
  },

  didFailSigning: function(transition) {
    var error = transition.eventArgs[0].error;
    this.set('error', error.jqXHR.responseJSON.errors.base[0]);
  },

  didFailProcessing: function(transition) {
    var error = transition.eventArgs[0];
    this.set('error', error.message);
  },

  didFail: function() {
    this.set('error', 'Image upload failed, try again later.');
  },

  reset: function() {
    this.set('upload',   null);
    this.set('progress', null);
    this.set('file',     null);
    this.set('error',    null);
  },

  _didProcessImage: function() {
    this.sendStateEvent('complete');
  }.on('processed'),

  _didFailProcessing: function(payload) {
    this.sendStateEvent('error', payload);
  }.on('failed')
});
