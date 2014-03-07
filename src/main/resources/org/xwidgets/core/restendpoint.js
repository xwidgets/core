package("org.xwidgets.core");

org.xwidgets.core.RestEndpoint = function() {
  xw.NonVisual.call();
  this._className = "org.xwidgets.core.RestEndpoint";
  this.registerProperty("url");
  this.registerProperty("method", "GET");
  this.registerProperty("callback");
};

org.xwidgets.core.RestEndpoint.prototype = new xw.NonVisual();

org.xwidgets.core.RestEndpoint.prototype.open = function() {};

org.xwidgets.core.RestEndpoint.prototype.invoke = function() { 
  var cb = this.callback ? this.callback : function() {};
  xw.Ajax.get(this.url, function(response) { cb(response); });
};

org.xwidgets.core.RestEndpoint.prototype.toString = function() {
  return "org.xwidgets.core.RestEndpoint[" + this.method + ":" + this.url + "]";
};
