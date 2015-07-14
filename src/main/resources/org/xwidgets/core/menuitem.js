package("org.xwidgets.core");

org.xwidgets.core.MenuDivider = xw.Visual.extend({
  _constructor: function() {
    this._super();
  },
  render: function(container) {
    this.menu.renderDivider(this, container);
  }
});

org.xwidgets.core.MenuItem = xw.Visual.extend({
  _constructor: function(label) {
    this._super();
    this.registerProperty("label", {default: ""});
    this.registerProperty("icon");
    this.registerProperty("enabled", {default: true});
    this.registerProperty("rendered", {default: true});
    this.registerProperty("styleClass", {default: "xw_menuitem"});
    this.registerProperty("selectedStyleClass", {default: "xw_menuitem_selected"});
    this.registerProperty("submenuStyleClass", {default: "xw_submenu"});
    this.registerProperty("definition", {listener: this.updateDefinition});
    this.registerEvent("onclick");
  },
  updateDefinition: function(def) {
    this.clearChildren();
 
    if (this.submenuContainer) {
      this.submenuContainer.parentNode.removeChild(this.submenuContainer);
      this.submenuContainer = null;
    }
    this.children = this.parseDefinition(def, this);
    this.propagateChildProperty(org.xwidgets.core.MenuItem, "menu", this.menu);
  },
  parseDefinition: function(nodes, parent) {
    var items = [];
    for (var node in nodes) {
      var mi = new org.xwidgets.core.MenuItem(nodes[node].label);
      mi.parent = parent; 
      
      if (nodes[node].children) {
        mi.children = this.parseDefinition(nodes[node].children, mi);
      }
      
      items.push(mi);
    }
    return items;
  },
  render: function(container) {
    this.menu.renderItem(this, container);
  },
  destroy: function() {
    this.menu.removeItem(this);
  },
  toString: function() {
    return "org.xwidgets.core.MenuItem[" + this.label.value + "]";
  }
});
//# sourceURL=menuitem.js
