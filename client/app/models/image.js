export default DS.Model.extend({
  uploadKey: DS.attr(),
  state:     DS.attr(),
  thumbUrl:  DS.attr(),
  normalUrl: DS.attr(),
  largeUrl:  DS.attr(),
  createdAt: DS.attr()
});
