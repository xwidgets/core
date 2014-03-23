package("org.xwidgets.core");
org.xwidgets.core.ELBinding = xw.NonVisual.extend({
  _constructor: function() {
    this.registerProperty("binding", {required: true});
    this.registerEvent("onbind");
    this.value = undefined;
  },
  open: function() {
    if (xw.Sys.isDefined(this.onbind)) {
      this.value = this.onbind.invoke(this);
    }     
    
    xw.EL.registerResolver(this);
    xw.EL.notify(this.binding.value);
  },
  canResolve: function(expr) {
    return expr == this.binding.value;
  },
  resolve: function(expr) {
    if (expr == this.binding.value) {
      return this.value;
    }  
  },
  toString: function() {
    return "org.xwidgets.core.ELBinding[" + this.binding.value + "]";
  }
});
