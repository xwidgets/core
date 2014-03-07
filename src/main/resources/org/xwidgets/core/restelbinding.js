package("org.xwidgets.core");

org.xwidgets.core.RestELBinding = function() {
  xw.NonVisual.call();
  this._className = "org.xwidgets.core.RestELBinding";
  this.registerProperty("binding");
  this.registerProperty("restEndpoint");
  this.registerProperty("mode", "JSON");
};

org.xwidgets.core.RestELBinding.prototype = new xw.NonVisual();

org.xwidgets.core.RestELBinding.prototype.open = function() {
  this.restEndpoint.callback = this.restCallback;
};

org.xwidgets.core.RestELBinding.prototype.restCallback = function(result) {
  alert("Got result: " + result);
};

org.xwidgets.core.RestELBinding.prototype.toString = function() {
  return "org.xwidgets.core.RestELBinding[" + this.binding + "]";
};
