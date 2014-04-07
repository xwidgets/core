package("org.xwidgets.core");

org.xwidgets.core.InputText = xw.Visual.extend({
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
      this.control.type = "text";      
      
      var that = this;
      var cb = function(evt) {
        that.checkValueChanged.call(that, evt);
      }
      xw.Sys.chainEvent(this.control, "keyup", cb);
      this.control.className = this.styleClass.value;
      if (this.name.value != null) {
        this.control.name = this.name.value;
      }
      if (this.value.value != null) {
        this.control.value = this.value.value;
      }
      container.appendChild(this.control);
    }
  },
  checkValueChanged: function(event) {
    var value = this.control.value;
    if (value != this.value.value) {
      this.value.value = value;
      if (this.formData.value != null) {
        this.formData.value.updateValue(this.control.name, this.value.value);
      }
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
  focus: function() {
    if (this.control != null) {
      this.control.focus();
    }
  },
  toString: function() {
    return "org.xwidgets.core.InputText[" + this.id.value + "]";
  }
});
