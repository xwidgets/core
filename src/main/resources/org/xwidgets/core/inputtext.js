package("org.xwidgets.core");

org.xwidgets.core.InputText = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("value", {default: null});
    this.registerProperty("styleClass", {default: ""});
    this.control = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("input");
      this.control.type = "text";
      this.control.className = this.styleClass;
      if (this.value != null) {
        this.control.value = this.value;
      }
      container.appendChild(this.control);
    }    
  },
  getValue: function() {
    return this.control.value;
  },
  setValue: function(value) {
    this.value.value = value;
    if (this.control != null) {
      this.control.value = this.value.value;
    }
  },
  toString: function() {
    return "org.xwidgets.core.InputText[" + this.id.value + "]";
  }
});
