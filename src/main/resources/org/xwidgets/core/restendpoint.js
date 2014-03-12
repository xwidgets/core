widget("org.xwidgets.core.RestEndpoint", xw.NonVisual, {
  create: function() {
    this.registerProperty("url", "");
    this.registerProperty("method", "GET");
    this.registerProperty("callback");
  },
  invoke: function() {
    var cb = this.callback ? this.callback : function() {};
    xw.Ajax.get(this.url, function(response) { cb(response); });  
  },
  toString: function() {
    return "org.xwidgets.core.RestEndpoint[" + this.method + ":" + this.url + "]";  
  }
});
