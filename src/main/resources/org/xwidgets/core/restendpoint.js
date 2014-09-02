package("org.xwidgets.core");

org.xwidgets.core.EndpointMethod = xw.NonVisual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("method");
    this.registerProperty("url");
  }
});

org.xwidgets.core.RestEndpoint = xw.NonVisual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("url");
    this.registerProperty("callback");
    this.registerProperty("decorator");
  },
  invoke: function(method, params, content, cb) {
    if (xw.Sys.isUndefined(cb)) {
      cb = this.callback.value ? this.callback.value : function() {};
    }

    var url = this.url.value;
    
    for (var c in this.children) {
      if (c instanceof org.xwidgets.core.EndpointMethod && c.method.value == method) {
        url = c.url.value;
      }
    }
    
    if (params) {
      for (var p in params) {
         var replaceParam = "{" + p + "}";
         url = url.replace(replaceParam, params[p]); 
      }
    }
    
    xw.Ajax.invoke({
      method: method,
      callback: function(response) { cb(response); },
      path: url,
      content: content,
      decorator: this.decorator.value,
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    });
  },
  get: function(params, content, cb) {
    this.invoke("GET", params, content, cb);
  },
  post: function(params, content, cb) {
    this.invoke("POST", params, content, cb);
  },
  put: function(params, content, cb) {
    this.invoke("PUT", params, content, cb);
  },
  delete: function(params, content, cb) {
    this.invoke("DELETE", params, content, cb);
  },
  toString: function() {
    return "org.xwidgets.core.RestEndpoint[" + this.method.value + ":" + this.url + "]";
  }
});
