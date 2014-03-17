package("org.xwidgets.core");

org.xwidgets.core.RestEndpoint = xw.NonVisual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("url");
    this.registerProperty("method", {default: "GET"});
    this.registerProperty("callback");
  },
  invoke: function() {
    var cb = this.callback ? this.callback : function() {};
    xw.Log.info("Sending AJAX request to [" + this.url + "]");
    xw.Ajax.get(this.url, function(response) { cb(response); });  
  },
  toString: function() {
    return "org.xwidgets.core.RestEndpoint[" + this.method + ":" + this.url + "]";  
  }
});
