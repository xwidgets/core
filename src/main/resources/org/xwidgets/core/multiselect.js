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
      this.control = document.createElement("span");
      this.parentSelect = this.findNearestAncestor(org.xwidgets.core.MultiSelect);
      this.parentSelect.addOption(this);
      this.parentSelect.setSelected(this.value.value, this.selected.value);
      
      if (this.styleClass.value != null) {
        this.control.className = this.styleClass.value;
      }

      container.appendChild(this.control);
      
      var that = this;
      var e = function(event) {
        xw.Sys.cancelEventBubble(event);
        that.toggle();
      };
      xw.Sys.chainEvent(this.control, "click", e);
      
      xw.Sys.chainEvent(this.control, "mousedown", function(event) {
        xw.Sys.cancelEventBubble(event); 
        });
      
      this.renderChildren(this.control);
    }
  },
  toggle: function() {
    var selected = !this.selected.value;
    if (this.parentSelect.setSelected(this.value.value, selected)) {
      this.setSelected(selected);
    }
  },
  setSelected: function(value) {
    if (this.selected.value !== value) {
      this.selected.value = value;
      xw.EL.notify("selected");
    }
  },
  resolve: function(name) {
    if (name == "selected") {
      return this.selected.value;
    }
  },  
  toString: function() {
    return "org.xwidgets.core.MultiSelectOption[" + this.value.value + "]";
  }
});

org.xwidgets.core.MultiSelect = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("name", {default: null});
    this.registerProperty("multi", {type: "boolean", default: true});
    this.registerProperty("values", {default: []});
    this.options = [];
  },
  setSelected: function(value, selected) {
    if (selected) {
      if (!xw.Array.contains(this.values.value, value)) {
        if (this.multi.value === false && this.values.value.length > 0) {
          for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].value.value !== value) {
              xw.Array.remove(this.values.value, this.options[i].value.value);
              this.options[i].setSelected(false);
            }
          }
        }
        this.values.value.push(value);
        return true;
      }
    } else {
      if (!(this.multi.value === false && this.values.value.length == 1 && xw.Array.contains(this.values.value, value))) {
        xw.Array.remove(this.values.value, value);
        return true;
      }
    }
    return false;
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

