package("org.xwidgets.core");

org.xwidgets.core.RestEndpoint = xw.NonVisual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("url");
    this.registerProperty("method", {default: "GET"});
    this.registerProperty("callback");
    this.registerProperty("decorator");
  },
  invoke: function(params, content, cb) {
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
    
    xw.Ajax.invoke({
      method: this.method.value,
      callback: function(response) { cb(response); },
      path: url,
      decorator: this.decorator.value
    });
  },
  toString: function() {
    return "org.xwidgets.core.RestEndpoint[" + this.method.value + ":" + this.url + "]";
  }
});
