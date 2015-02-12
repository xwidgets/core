package("org.xwidgets.core");

org.xwidgets.core.Zone = xw.Visual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("value", {default: null, listener: this.updateValue});
    this.registerProperty("activeOn", {default: null, listener: this.updateActiveOn}); 
    this.childrenRendered = false;
    this.control = null;
    this.activeValues = [];
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("span");
      this.updateValue(this.value.value);
      container.appendChild(this.control);
      this.renderChildren(this.control);
    }    
  },
  updateValue: function(value) {
    var disp = false;
    for (var i = 0; i < this.activeValues.length; i++) {
      if (value == this.activeValues[i]) {
        disp = true;
      }
    }
    if (this.control != null) {
      this.control.style.display = disp ? "" : "none";
    }
  },
  updateActiveOn: function(value) {
    this.activeValues = value.split(",");
  },
  toString: function() {
    return "org.xwidgets.core.Zone[" + this.activeOn + "]";
  }
});
//# sourceURL=zone.js
