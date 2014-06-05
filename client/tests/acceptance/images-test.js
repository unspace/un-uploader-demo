import startApp from '../helpers/start-app';
import { defineFixture } from 'ic-ajax';

defineFixture('/api/images', {
  response: {"images":[{"id":"7b4d23b4-9864-42f6-8676-aa192c2a3174","state":"processed","created_at":"2014-06-05T02:20:46.139Z","thumb_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/7b4d23b4-9864-42f6-8676-aa192c2a3174-thumb.jpg","normal_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/7b4d23b4-9864-42f6-8676-aa192c2a3174-normal.jpg","large_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/7b4d23b4-9864-42f6-8676-aa192c2a3174-large.jpg"},{"id":"3d233a3f-e2e8-42ef-b54a-c0586938ba0d","state":"processed","created_at":"2014-06-05T02:20:45.407Z","thumb_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/3d233a3f-e2e8-42ef-b54a-c0586938ba0d-thumb.jpg","normal_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/3d233a3f-e2e8-42ef-b54a-c0586938ba0d-normal.jpg","large_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/3d233a3f-e2e8-42ef-b54a-c0586938ba0d-large.jpg"},{"id":"52833d41-e23d-4dfa-88f8-c96cab141bb2","state":"processed","created_at":"2014-06-05T02:20:39.685Z","thumb_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/52833d41-e23d-4dfa-88f8-c96cab141bb2-thumb.jpg","normal_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/52833d41-e23d-4dfa-88f8-c96cab141bb2-normal.jpg","large_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/52833d41-e23d-4dfa-88f8-c96cab141bb2-large.jpg"},{"id":"bf6ad6ea-f2bd-4077-a5a6-d1da22fa7758","state":"processed","created_at":"2014-06-05T02:18:08.253Z","thumb_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/bf6ad6ea-f2bd-4077-a5a6-d1da22fa7758-thumb.jpg","normal_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/bf6ad6ea-f2bd-4077-a5a6-d1da22fa7758-normal.jpg","large_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/bf6ad6ea-f2bd-4077-a5a6-d1da22fa7758-large.jpg"},{"id":"9cfaedb1-5e44-424f-b0dd-04f1fca421b2","state":"processed","created_at":"2014-06-05T02:17:57.066Z","thumb_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/9cfaedb1-5e44-424f-b0dd-04f1fca421b2-thumb.jpg","normal_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/9cfaedb1-5e44-424f-b0dd-04f1fca421b2-normal.jpg","large_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/9cfaedb1-5e44-424f-b0dd-04f1fca421b2-large.jpg"},{"id":"0ff371e4-a14e-4065-b363-c4f23dbf4b2b","state":"processed","created_at":"2014-06-05T02:17:47.024Z","thumb_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/0ff371e4-a14e-4065-b363-c4f23dbf4b2b-thumb.jpg","normal_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/0ff371e4-a14e-4065-b363-c4f23dbf4b2b-normal.jpg","large_url":"http://un-uploader-dev.s3.amazonaws.com/assets/images/0ff371e4-a14e-4065-b363-c4f23dbf4b2b-large.jpg"}]},
  textStatus: 'success'
});

var App;

var indexUrl = '/images';

module('Acceptances - Dataset', {
  setup: function() {
    App = startApp();
    visit(indexUrl);
  },

  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("Shows the file-picker", function(){
  expect(1);
  var button = find('.file-picker');
  equal(button.length, 1, 'no file-picker button');
});

test("Shows existing images", function(){
  expect(1);
  var button = find('.image-item');
  equal(button.length, 6, 'missing image items');
});
