package("org.xwidgets.core");

org.xwidgets.core.MenuDivider = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.control = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("hr");
      container.appendChild(this.control);
    }
  }
});

org.xwidgets.core.MenuItem = xw.Visual.extend({
  _constructor: function(label) {
    this._super();
    this.registerProperty("label", {default: label});
    this.registerProperty("rendered", {default: true});
    this.registerProperty("styleClass", {default: "xw_menuitem"});
    this.registerProperty("selectedStyleClass", {default: "xw_menuitem_selected"});
    this.registerProperty("submenuStyleClass", {default: "xw_submenu"});
    this.registerProperty("definition", {listener: this.updateDefinition});
    this.registerEvent("onclick");
  },
  updateDefinition: function(def) {
    // Clear all the current children - TODO move this to the base Widget class
    if (xw.Sys.isDefined(this.children)) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].destroy();
      }
    }
  
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
  click: function(event) {
    if (this.children.length == 0) {
      if (this.onclick) {
        this.menu.close();
        this.onclick.invoke(this.menu);
      } else if (this.menu.onclick) {
        this.menu.close();
        this.menu.onclick.invoke(this.menu, {item: this});
      }
    } else {
      this.menu.selectItem(this);    
    }
    xw.Sys.cancelEventBubble(event);
  },
  mouseOver: function(event) {
    if (this.menu.isOpen()) {
      org.xwidgets.core.MenuItem.trackMouseOver(this);
    }
    xw.Sys.cancelEventBubble(event);
  }
});

org.xwidgets.core.MenuItem.mouseOverItem = null;
org.xwidgets.core.MenuItem.mouseOverTimeout = null;

org.xwidgets.core.MenuItem.trackMouseOver = function(menuItem) {
  var mi = org.xwidgets.core.MenuItem;

  if (menuItem != mi.mouseOverItem) {
    // Unselect the currently selected item
    if (mi.mouseOverItem != null) {
      mi.mouseOverItem.menu.renderSelected(mi.mouseOverItem, false);
    }
  
    // Clear the existing timeout function if it's set
    if (mi.mouseOverTimeout) {
      clearTimeout(mi.mouseOverTimeout);
      mi.mouseOverTimeout = null;
    }
    
    // Set the new item
    mi.mouseOverItem = menuItem;
    
    // Create a new timeout
    var cb = function() {
      mi.mouseOverCallback(menuItem);      
    }
    mi.mouseOverTimeout = setTimeout(cb, 300);
  }
};
  
org.xwidgets.core.MenuItem.mouseOverCallback = function(menuItem) {
  var mi = org.xwidgets.core.MenuItem;
  if (menuItem == mi.mouseOverItem && menuItem != menuItem.menu.selectedMenuItem) {
    menuItem.menu.selectItem(menuItem);
  }
};
