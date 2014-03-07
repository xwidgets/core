package("org.xwidgets.core");

org.xwidgets.core.RestEndpoint = function() {
  xw.NonVisual.call();
  this._className = "org.xwidgets.core.RestEndpoint";
  this.registerProperty("url");
  this.registerProperty("method", "GET");
  this.registerProperty("serviceHandler");
};

org.xwidgets.core.RestEndpoint.prototype = new xw.NonVisual();

org.xwidgets.core.RestEndpoint.prototype.open = function() {};

org.xwidgets.core.RestEndpoint.prototype.call = function() { 
  var ep = this;
  var cb = function(response) { ep.processResponse(response); }
  xw.Ajax.get(this.url, cb);
};

org.xwidgets.core.RestEndpoint.prototype.processResponse = function(response) {
  alert("Received response: " + response);
};

org.xwidgets.core.RestEndpoint.prototype.toString = function() {
  return "org.xwidgets.core.RestEndpoint[" + this.location + "]";
};
