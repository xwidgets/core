package("org.xwidgets.core");

org.xwidgets.core.MultiSelectOption = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("selected", {type: "boolean", default: false});
    this.registerProperty("value", {default: null});
    this.registerProperty("styleClass", {default: null});
    this.parentSelect = null;
    this.control = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.parentSelect = this.findNearestAncestor(org.xwidgets.core.MultiSelection);
      this.parentSelect.addOption(this);
      
      this.control = document.createElement("span");
      if (this.styleClass.value != null) {
        this.control.className = this.styleClass.value;
      }

      container.appendChild(this.control);
      
      xw.register
      
      this.renderChildren(this.control);
    }
  },
  resolve: function(name) {
    if (name == "selected") {
      return this.selected.value;
    }
  },  
  toString: function() {
    return "org.xwidgets.core.MultiSelectOption[" + this.id.value + "]";
  }
});

org.xwidgets.core.MultiSelection = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("name", {default: null});
    this.registerProperty("multi", {default: true});
    this.registerProperty("values", {default: []});
    this.options = [];
  },
  render: function(container) {
    this.renderChildren(container);
  },
  addOption: function(option) {
    this.options.push(option);
  },
  toString: function() {
    return "org.xwidgets.core.MultiSelection[" + this.id.value + "]";
  }
});

