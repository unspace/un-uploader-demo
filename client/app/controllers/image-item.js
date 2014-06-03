import { request } from 'ic-ajax';

export default Em.ObjectController.extend(Em.FSM.Stateful, {
  file:            null,
  xhr:             null,
  upload:          null,
  progress:        null,
  receivedPromise: null,
  isProcessed:     Em.computed.equal('model.state', 'processed'),
  hasUpload:       Em.computed.bool('upload'),
  hasFile:         Em.computed.bool('file'),
  canUpload:       Em.computed.and('hasFile', 'hasUpload', 'isWaiting'),

  wholeProgress: function() {
    var progress = this.get('progress');

    if (Em.isNone(progress)) {
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

  states: {
    initialState: 'waiting'
  },

  stateEvents: {
    start: {
      transition: { waiting: 'signing',
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

    xhr.then(function(payload) {
      model.set('id', payload.upload.id);
      controller.set('upload', payload.upload);
    });

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
    this.sendStateEvent('process');
  },

  enqueueImageForProcessing: function() {
    var image  = this.get('model');
    var upload = this.get('upload');

    image.set('uploadKey', upload.key);

    return image.save();
  },

  didProcessImage: function() {
    this.sendStateEvent('complete');
  }.on('processed'),

  didComplete: function() {
    this.set('upload', null);
    this.set('progress', null);
    this.set('file', null);
    this.get('model').reload();
  }
});
