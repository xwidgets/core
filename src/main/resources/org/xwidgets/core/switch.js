package("org.xwidgets.core");

org.xwidgets.core.Case = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("value", {required: true});
    this.registerProperty("default", {default: false});    
  },
  render: function(container) {
    this.renderChildren(container);
  }
});

org.xwidgets.core.Switch = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("value", {required: true});
  },
  render: function(container) {
    var def = null;
    var c = this.children;
    for (var i = 0; i < c.length; i++) {
      if (c[i].value.value == this.value.value) {
        c[i].render(container);
        return;
      } else if (def === null && c[i].default.value === true) {
        def = c[i];
      }
    }
    
    if (def !== null) {
      def.render(container);
    }
  },
  toString: function() {
    return "org.xwidgets.core.Switch[" + this.value.value + "]";
  },
  destroy: function() {
    this._super();
  }
});
//# sourceURL=switch.js
