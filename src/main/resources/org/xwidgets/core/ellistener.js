package("org.xwidgets.core");
org.xwidgets.core.ELListener = xw.NonVisual.extend({
  _constructor: function() {
    this.registerProperty("binding", {required: true, listener: this.valueChanged});
    this.registerEvent("onvaluechanged");
    this.value = undefined;
  },
  open: function() {  
  },
  valueChanged: function(value) {
    if (value != this.value) {
      this.value = value;
      if (xw.Sys.isDefined(this.onvaluechanged)) {
        this.onvaluechanged.invoke(this, {value: this.value});
      }
    }
  },
  toString: function() {
    return "org.xwidgets.core.ELListener[" + this.binding.value + "]";
  },
  destroy: function() {
    xw.EL.clearWidgetBindings(this);
    this._super();
  }
});
