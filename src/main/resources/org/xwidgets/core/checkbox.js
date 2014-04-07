package("org.xwidgets.core");

org.xwidgets.core.Checkbox = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("styleClass", {default: ""});
    this.registerProperty("name", {default: ""});
    this.registerProperty("formData", {default: null});
    this.registerProperty("value", {default: false});
    this.control = null;
  },   
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("input");
      this.control.type = "checkbox";
      this.control.className = this.styleClass.value; 
      this.control.checked = (this.value.value == true);
      
      if (this.name.value != null) {
        this.control.name = this.name.value;
      }
      
      var that = this;
      cb = function(evt) {
        that.valueChangedCallback.call(that, evt);
      }
      xw.Sys.chainEvent(this.control, "change", cb);
      
      container.appendChild(this.control);
    }
  },
  valueChangedCallback: function(event) {
    if (xw.Sys.isDefined(this.formData.value)) {
      this.formData.value.updateValue(this.control.name, this.control.checked);
    }
    this.value.value = this.control.checked;
  },
  getValue: function() {
    return this.value.value;
  },
  focus: function() {
    if (this.control != null) {
      this.control.focus();
    }
  },
  destroy: function() {
    this._super();
  }
});

