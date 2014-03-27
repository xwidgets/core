package("org.xwidgets.core");
org.xwidgets.core.FormData = xw.NonVisual.extend({
  _constructor: function() {
    this._super();
    this.value = {};
  },
  open: function() { },
  updateValue: function(name, value) {
    this.value[name] = value;
  },
  toString: function() {
    return "org.xwidgets.core.FormData[" + this.id.value + "]";
  },
  destroy: function() {
    this._super();
  }
});
