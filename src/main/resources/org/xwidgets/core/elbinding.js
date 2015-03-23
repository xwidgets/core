package("org.xwidgets.core");
org.xwidgets.core.ELBinding = xw.NonVisual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("binding", {required: true});
    this.registerProperty("value", {default: undefined, onChange: this.notifyValueChanged});
    this.registerEvent("onbind");
  },
  open: function() {
    if (xw.Sys.isUndefined(this.value) && xw.Sys.isDefined(this.onbind)) {
      this.value = this.onbind.invoke(this);
    }
    
    xw.EL.registerResolver(this);
    xw.EL.notify(this.binding);
  },
  canResolve: function(expr) {
    return expr == this.binding;
  },
  resolve: function(expr) {
    if (expr == this.binding) {
      return this.value;
    }
  },
  notifyValueChanged: function() {
    xw.EL.notify(this.binding);
  },
  toString: function() {
    return "org.xwidgets.core.ELBinding[" + this.binding + "]";
  },
  destroy: function() {
    xw.EL.unregisterResolver(this);
    this._super();
  }
});
//# sourceURL=elbinding.js
