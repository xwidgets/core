widget("org.xwidgets.core.RestELBinding", xw.NonVisual, {
  _constructor: function() {
    this.registerProperty("binding");
    this.registerProperty("restEndpoint");
    this.registerProperty("mode", "JSON"); 
    this.value = undefined;
  },
  open: function() {
    var that = this;
    var cb = function(result) { that.restCallback(result); };
    this.restEndpoint.callback = cb;
    xw.EL.registerResolver(this);
  },
  restCallback: function(result) {
    if ("JSON" == this.mode) {
      this.value = JSON.parse(result);
    }    
    xw.EL.notify(this.binding);  
  },
  canResolve: function(expr) {
    return expr == this.binding;  
  },
  resolve: function(expr) {
    if (expr == this.binding) {
      if (xw.Sys.isDefined(this.value)) {
        return this.value;
      } else {
        this.restEndpoint.invoke();
      }
    }  
  },
  toString: function() {
    return "org.xwidgets.core.RestELBinding[" + this.binding + "]";
  }
});
