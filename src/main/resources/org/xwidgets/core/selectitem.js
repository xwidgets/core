package("org.xwidgets.core");

org.xwidgets.core.SelectItem = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("itemValue", {default: null});
    this.registerProperty("itemLabel", {default: null});
    this.rendered = false;
  },
  render: function() { 
    if (!this.rendered) {
      this.parent.addItem(this.itemValue.value, this.itemLabel.value);
      this.rendered = true;
    }
  }
}); 
