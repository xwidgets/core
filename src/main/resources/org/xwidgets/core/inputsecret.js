package("org.xwidgets.core");

org.xwidgets.core.InputSecret = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("value", {default: null});
    this.registerProperty("styleClass", {default: ""});
    this.control = null;
  },  
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("input");
      this.control.type = "password";
      this.control.className = this.styleClass;
      container.appendChild(this.control);
    }    
  },
  getValue: function() {
    return this.control.value;
  },
  toString: function() {
    return "org.xwidgets.core.InputSecret[" + this.id.value + "]";
  }
});
