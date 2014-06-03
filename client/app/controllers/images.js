export default Ember.ArrayController.extend(Em.FSM.Stateful, {
  actions: {
    addFile: function(file) {
      Em.Logger.info('file ting:', file);
    }
  },

  states: {
    initialState: 'nofiles'
  },

  stateEvents: {
    addFile: {
      transition: {
        from:   ['nofile', 'failed'],
        to:     'ready',
        before: 'checkFile',
      }
    },

    startUpload: {
      transition: { ready: 'uploading',
        before:   'getUploadURL',
        didEnter: 'performUpload',
        after:    'finishedUpload'
      }
    },

    finishUpload: {
      transition: { uploading: 'nofile',
        didEnter: 'reset'
      }
    }
  },

  reset: function() {
    this.set('file', null);
  },

  checkFile: function() {
    var file = this.get('file');

    if (file.size > 0) {
      return;
    } else {
      this.get('controllers.notifier').warn('file must have content');
      Em.FSM.reject(); // A helper for throwing an error
    }
  },

  getUploadURL: function() {
    var controller = this;
    var fileName = this.get('file.name');
    var xhr;

    xhr = $.ajax('/api/signed_uploads', {
      type: 'put',
      data: { file: { name: fileName } }
    });

    xhr.then(function(payload) {
      Em.run(function() {
        controller.set('uploadToURL', payload.signed_upload.url);
      });
    });

    return xhr; // Causes transition to block until promise is settled
  },

  performUpload: function() {
    return $.ajax(this.get('uploadToURL'), {
      type: 'put',
      data: this.get('file')
    });
  },

  finishedUpload: function() {
    this.get('controllers.notifier').success('Upload complete');
    this.sendStateEvent('finishUpload');
  }
});
