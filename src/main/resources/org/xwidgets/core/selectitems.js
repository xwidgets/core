package("org.xwidgets.core");

org.xwidgets.core.SelectItems = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("value", {default: null}); 
    this.registerProperty("var", {default: null});
    this.registerProperty("itemValue", {default: null});
    this.registerProperty("itemLabel", {default: null});
    this.rendered = false;
    this.currentItem = null;
  },
  render: function() {
    this.renderOptions();
    this.rendered = true;
  },
  renderOptions: function() {
    if (this.value.value != null) {
      for (var i = 0; i < this.value.value.length; i++) {
        this.currentItem = this.value.value[i];
        this.parent.addItem(xw.EL.eval(this, this.itemValue.value),
          xw.EL.eval(this, this.itemLabel.value), this.value.value[i]);
      }
    }
  },
  resolve: function(name) {
    if (name == this.var) {
      return this.currentItem;
    }
  }
});

