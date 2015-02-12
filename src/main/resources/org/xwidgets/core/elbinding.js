package("org.xwidgets.core");
org.xwidgets.core.ELBinding = xw.NonVisual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("binding", {required: true});
    this.registerProperty("value", {default: undefined});
    this.registerEvent("onbind");
  },
  open: function() {
    if (xw.Sys.isUndefined(this.value.value) && xw.Sys.isDefined(this.onbind)) {
      this.value.value = this.onbind.invoke(this);
    }
    
    xw.EL.registerResolver(this);
    xw.EL.notify(this.binding.value);
  },
  canResolve: function(expr) {
    return expr == this.binding.value;
  },
  resolve: function(expr) {
    if (expr == this.binding.value) {
      return this.value.value;
    }
  },
  setValue: function(value) {
    this.value.value = value;
    xw.EL.notify(this.binding.value);
  },
  toString: function() {
    return "org.xwidgets.core.ELBinding[" + this.binding.value + "]";
  },
  destroy: function() {
    xw.EL.unregisterResolver(this);
    this._super();
  }
});
//# sourceURL=elbinding.js
