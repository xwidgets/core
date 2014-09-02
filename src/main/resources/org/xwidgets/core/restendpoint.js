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
  invoke: function(method, params) {
    if (xw.Sys.isUndefined(params)) {
      params = {};
    }
  
    var cb = xw.Sys.isDefined(params.callback) ?
      params.callback :
      (this.callback.value ? this.callback.value : function() {});

    var m = xw.Sys.isDefined(params.method) ? params.method : (method ? method : "GET");

    var url = this.url.value;  
    
    for (var c in this.children) {
      if (c instanceof org.xwidgets.core.EndpointMethod && c.method.value == method) {
        url = c.url.value;
      }
    }
    
    if (xw.Sys.isDefined(params.queryParams)) {
      var queryParams = "";

      for (var p in params.queryParams) {
        if (queryParams.length > 0) {
          queryParams += "&";
        }
        queryParams += encodeURIComponent(p + "=" + params.queryParams[p]);
      }
      
      url += "?" + queryParams;
    }
    
    if (xw.Sys.isDefined(params.pathParams)) {
      for (var p in params.pathParams) {
        url = url.replace("{" + p + "}", params.pathParams[p]); 
      }
    }
    
    var content = xw.Sys.isDefined(params.content) ? params.content : null;
    
    xw.Ajax.invoke({
      method: m,
      callback: function(response) { cb(response); },
      path: url,
      content: content,
      decorator: this.decorator.value,
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    });
  },
  get: function(params) {
    this.invoke("GET", params);
  },
  post: function(params) {
    this.invoke("POST", params);
  },
  put: function(params) {
    this.invoke("PUT", params);
  },
  delete: function(params) {
    this.invoke("DELETE", params);
  },
  toString: function() {
    return "org.xwidgets.core.RestEndpoint[" + this.method.value + ":" + this.url + "]";
  }
});
