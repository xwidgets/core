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
    if (this.var.value != null) {
      xw.EL.registerResolver(this);
    }
    
    if (this.value.value != null) {
      for (var i = 0; i < this.value.value.length; i++) {
        this.currentItem = this.value.value[i];
        if (this.var.value != null) {
          xw.EL.notify(this.var.value);
        }
        this.parent.addItem(this.itemValue.value, this.itemLabel.value, this.value.value[i]);
      }
    }
    
    xw.EL.unregisterResolver(this);
  },
  canResolve: function(expr) {
    return expr == this.var.value;
  },
  resolve: function(expr) {
    if (expr == this.var.value) {
      return this.currentItem;
    }
  }
});


org.xwidgets.core.Select = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("styleClass", {default: ""});
    this.registerProperty("name");
    this.control = null;
    this.objectValues = [];
  },
  render: function(container) {
    if (this.control == null) {  
      this.control = document.createElement("select");
      this.control.className = this.styleClass.value;
      container.appendChild(this.control);  
      
      this.renderChildren(this.control);
    }       
  },
  addItem: function(value, label, obj) {
    var opt = document.createElement("option");
    opt.value = value;
    opt.text = label;
    this.control.add(opt, null);
    this.objectValues.push({value: value, object: obj});
  },
  removeItem: function(value) {
    // TODO implement this 
  },
  getValue: function() {
    return this.control.options[this.control.selectedIndex].value;
  },
  getObjectValue: function() {
    var value = this.getValue();
    for (var i = 0; i < this.objectValues.length; i++) {
      if (this.objectValues[i].value == value) {
        return this.objectValues[i].object;
      }
    }
    return undefined;
  },
  toString: function() {
    return "org.xwidgets.core.Select[" + this.id.value + "]";
  }
});
