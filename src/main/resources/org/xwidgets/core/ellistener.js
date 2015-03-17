package("org.xwidgets.core");
org.xwidgets.core.ELListener = xw.NonVisual.extend({
  _constructor: function() {
    this.registerProperty("binding", {required: true, listener: this.valueChanged});
    this.registerEvent("onvaluechanged");
    this.opened = false;
    this.value = undefined;
  },
  open: function() {
    if (!this.opened) {
      this.opened = true;
      if (xw.Sys.isDefined(this.value) && xw.Sys.isDefined(this.onvaluechanged)) {
        this.onvaluechanged.invoke(this, {value: this.value});
      }
    }
  },
  valueChanged: function(value) {
    if (value != this.value) {
      this.value = value;    
      // Don't invoke the onvaluechanged event until the widget has actually been opened
      if (this.opened && xw.Sys.isDefined(this.onvaluechanged)) {
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
//# sourceURL=ellistener.js
