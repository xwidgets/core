package("org.xwidgets.core");

org.xwidgets.core.TextArea = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("name", {default: null});
    this.registerProperty("value", {default: null});
    this.registerProperty("rows", {default: null});
    this.registerProperty("formData", {default: null});
    this.registerProperty("styleClass", {default: null});
    this.control = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("textarea");     
      
      var that = this;
      var cb = function(evt) {
        that.checkValueChanged.call(that, evt);
      }
      xw.Sys.chainEvent(this.control, "keyup", cb);
      
      if (xw.Sys.isDefined(this.styleClass.value)) {
        this.control.className = this.styleClass.value;
      }

      if (this.name.value != null) {
        this.control.name = this.name.value;
      }

      if (this.value.value != null) {
        this.control.value = this.value.value;
      }
      
      if (this.rows.value != null) {
        this.control.rows = this.rows.value;
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
    return "org.xwidgets.core.TextArea[" + this.id.value + "]";
  }
});
//# sourceURL=textarea.js
