package("org.xwidgets.core");

org.xwidgets.core.RestEndpoint = xw.NonVisual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("url");
    this.registerProperty("method", {default: "GET"});
    this.registerProperty("callback");
  },
  invoke: function(params, cb) {
    if (xw.Sys.isUndefined(cb)) {
      cb = this.callback.value ? this.callback.value : function() {};
    }
    
    var url = this.url.value;
    if (params) {
      for (var p in params) {
         var replaceParam = "{" + p + "}";
         url = url.replace(replaceParam, params[p]); 
      }
    }
    
    xw.Ajax.get(url, function(response) { cb(response); });
  },
  toString: function() {
    return "org.xwidgets.core.RestEndpoint[" + this.method.value + ":" + this.url + "]";
  }
});
