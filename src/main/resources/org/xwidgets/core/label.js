package("org.xwidgets.core");

org.xwidgets.core.Label = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("value", {default: ""});
    this.registerProperty("styleClass", {default: ""});
    this.control = null;
  },
  render: function(container) {
    if (this.control == null) {
      var s = document.createElement("label");
      this.control = document.createTextNode(this.value);
      s.className = this.styleClass.value;
      s.appendChild(this.control);
      container.appendChild(s);
    }       
  },
  setValue: function(value) {
    this.value.value = value;
    if (this.control) this.control.data = value;
  },
  toString: function() {
    return "org.xwidgets.core.Label[" + this.id.value + "]";
  }
});
