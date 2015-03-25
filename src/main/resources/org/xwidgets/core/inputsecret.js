package("org.xwidgets.core");

org.xwidgets.core.InputSecret = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("name", {default: null});
    this.registerProperty("value", {default: null});
    this.registerProperty("formData", {default: null});
    this.registerProperty("styleClass", {default: ""});
    this.control = null;
  },  
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("input");
      this.control.type = "password";
      var that = this;
      var cb = function(evt) {
        that.checkValueChanged.call(that, evt);
      }
      xw.Sys.chainEvent(this.control, "keyup", cb);
      this.control.className = this.styleClass;
      container.appendChild(this.control);
    }    
  },
  checkValueChanged: function(event) {
    var value = this.control.value;
    if (value != this.value) {
      this.value = value;
      if (this.formData != null) {
        this.formData.updateValue(this.name, this.value);
      }
    }
  },
  getValue: function() {
    return this.control.value;
  },
  toString: function() {
    return "org.xwidgets.core.InputSecret[" + this.id + "]";
  }
});
//# sourceURL=inputsecret.js
