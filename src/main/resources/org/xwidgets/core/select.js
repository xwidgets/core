package("org.xwidgets.core");

org.xwidgets.core.Select = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("styleClass", "");
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
