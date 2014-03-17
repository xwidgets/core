package("org.xwidgets.core");
org.xwidgets.core.RestELBinding = xw.NonVisual.extend({
  _constructor: function() {
    this.registerProperty("binding");
    this.registerProperty("restEndpoint", {elListener: "restEndpoint"});
    this.registerProperty("mode", {default: "JSON"});
    this.registerEvent("onresult");
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
      result = JSON.parse(result);
    } 
        
    if (xw.Sys.isDefined(this.onresult)) {
      result = this.onresult.invoke(this, {result:result});
    } 

    this.value = result;
       
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
