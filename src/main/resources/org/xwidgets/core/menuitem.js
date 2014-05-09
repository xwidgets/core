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
    this.control = null;
    this.submenuContainer = null;
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
    if (this.control == null) {
      this.control = document.createElement("div");
      
      this.control.appendChild(document.createTextNode(this.label.value === null ? "" : this.label.value));
      
      if (this.children.length > 0) {
        var icon = document.createElement("i");
        icon.className ="fa fa-caret-right fa-fw";
        this.control.appendChild(icon);
      }
      
      if (xw.Sys.isDefined(this.styleClass.value)) {
        this.control.className = this.styleClass.value;
      }
      container.appendChild(this.control);
      
      var that = this;

      var clickEvent = function(event) {
        that.click(event);
      }
            
      xw.Sys.chainEvent(this.control, "click", clickEvent);
      
      // Disable default text selection behaviour
      var mouseDownEvent = function(event) {
        xw.Sys.cancelEventBubble(event);
      };
      xw.Sys.chainEvent(this.control, "mousedown", mouseDownEvent);
      
      if (this.children.length > 0) {
        var mouseOverEvent = function(event) {
          that.mouseOver(event);
        }
        xw.Sys.chainEvent(this.control, "mouseover", mouseOverEvent);
      }
    }
  },
  destroy: function() {
    if (this.submenuContainer) {
      this.submenuContainer.parentNode.removeChild(this.submenuContainer);
      this.submenuContainer = null;
    }
    if (this.control) {
      this.control.parentNode.removeChild(this.control);
      this.control = null;
    }
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
  },
  select: function() {
    if (this.children.length > 0) {
      var c = this.submenuContainer;
      if (c == null) {
        c = document.createElement("div");
        if (xw.Sys.isDefined(this.submenuStyleClass.value)) {
          c.className = this.submenuStyleClass.value;
        }
        
        c.style.position = "absolute";
        c.style.zIndex = 255;       
        c.style.overflow = "hidden";
        
        this.renderChildren(c);
        
        document.body.appendChild(c);
        this.submenuContainer = c; 
      }
      
      var rect = this.control.getBoundingClientRect();        

      if (this.parent instanceof org.xwidgets.core.MenuItem) {
        var containerRect = this.parent.submenuContainer.getBoundingClientRect();
        c.style.top = rect.top + "px";
        c.style.left = (containerRect.right + 1) + "px";
      } else if (this.parent instanceof org.xwidgets.core.PopupMenu) {
        var containerRect = this.parent.control.getBoundingClientRect();
        c.style.top = rect.top + "px";
        c.style.left = (containerRect.right + 1) + "px";                
      } else {
        c.style.top = (rect.bottom + 1) + "px";
        c.style.left = rect.left + "px";
      }
      
      this.submenuContainer.style.display = "";
    }
    if (xw.Sys.isDefined(this.selectedStyleClass.value)) {
      this.control.className = this.selectedStyleClass.value;
    }
  },
  unselect: function() {
    if (this.submenuContainer) {
      this.submenuContainer.style.display = "none";  
    }
    if (xw.Sys.isDefined(this.styleClass.value)) {
      this.control.className = this.styleClass.value;
    }
  }
});

org.xwidgets.core.MenuItem.mouseOverItem = null;
org.xwidgets.core.MenuItem.mouseOverTimeout = null;

org.xwidgets.core.MenuItem.trackMouseOver = function(menuItem) {
  var mi = org.xwidgets.core.MenuItem;

  if (menuItem != mi.mouseOverItem) {
    // Unselect the currently selected item
    if (mi.mouseOverItem != null) {
      mi.mouseOverItem.unselect();
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
