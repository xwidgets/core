package("org.xwidgets.core");

org.xwidgets.core.MenuItem = xw.Visual.extend({
  _constructor: function(label) {
    this._super();
    this.registerProperty("label", {default: label});
    this.registerProperty("rendered");
    this.registerProperty("styleClass", {default: "xw_menuitem"});
    this.registerProperty("selectedStyleClass", {default: "xw_menuitem_selected"});
    this.registerProperty("submenuStyleClass", {default: "xw_submenu"});
    this.registerProperty("definition", {elListener: this.updateDefinition});
    this.registerEvent("onclick");
    this.control = null;
    this.submenuContainer = null;
  },
  updateDefinition: function(def) {
    // If the submenu is open, close it
    if (this.submenuOpen) {
      this.unselect();
    }
    // Clear all the current children - TODO move this to the base Widget class
    if (xw.Sys.isDefined(this.childen)) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].destroy();
      }
    }
  
    this.children = this.parseDefinition(def, this);    
  },
  parseDefinition: function(nodes, parent) {
    var items = [];
    for (var node in nodes) {
      var mi = new org.xwidgets.core.MenuItem(nodes[node].label);
      mi.setParent(parent); 
      
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
      
      this.control.appendChild(document.createTextNode(this.label === null ? "" : this.label));      
      
      if (this.children.length > 0) {
        var icon = document.createElement("i");
        icon.className ="fa fa-caret-right fa-fw";
        this.control.appendChild(icon);
      }
      
      if (xw.Sys.isDefined(this.styleClass)) {
        this.control.className = this.styleClass;
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
  click: function(event) {
    var menuBar = this.getMenuBar();
    menuBar.selectItem(this);
    if (this.children.length == 0) {
      if (this.onclick) {
        menuBar.close();
        this.onclick(event);
      } else if (menuBar && menuBar.onclick) {
        menuBar.close();
        menuBar.onclick.invoke(menuBar, {item: this});
      }
    }
    xw.Sys.cancelEventBubble(event);
  },
  mouseOver: function(event) {
    if (this.getMenuBar().isOpen()) {
      this.getMenuBar().trackMouseOver(this);
    }
    
    xw.Sys.cancelEventBubble(event);
  },
  getMenuBar: function() {
    var p = this.parent;
    while (!(p instanceof org.xwidgets.core.MenuBar) && xw.Sys.isDefined(p)) {
      p = p.parent;
    }
    return p;
  },
  select: function() {
    if (this.children.length > 0) {
      var c = this.submenuContainer;
      if (c == null) {
        c = document.createElement("div");
        if (xw.Sys.isDefined(this.submenuStyleClass)) {
          c.className = this.submenuStyleClass;
        }
        
        c.style.position = "absolute";
        c.style.zIndex = 10;
        
        var rect = this.control.getBoundingClientRect();        

        if (this.parent instanceof org.xwidgets.core.MenuBar) {
          c.style.top = (rect.bottom + 1) + "px";  
          c.style.left = rect.left + "px";
        } else {
          var containerRect = this.parent.submenuContainer.getBoundingClientRect();
          c.style.top = rect.top + "px";
          c.style.left = (containerRect.right + 1) + "px";
        }
        c.style.overflow = "hidden";
        
        this.renderChildren(c);
        
        document.body.appendChild(c);
        this.submenuContainer = c; 
      }
      this.submenuContainer.style.display = "";
    }
    if (xw.Sys.isDefined(this.selectedStyleClass)) {
      this.control.className = this.selectedStyleClass;
    }
  },
  unselect: function() {
    if (this.submenuContainer) {
      this.submenuContainer.style.display = "none";  
    }
    if (xw.Sys.isDefined(this.styleClass)) {
      this.control.className = this.styleClass;
    }
  }
});

org.xwidgets.core.MenuBar = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("styleClass", {default: "xw_menubar"});
    this.registerEvent("onclick");
    this.control = null;    
    this.selectedMenuItem = null;
    this.mouseOverItem = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("div");
      if (xw.Sys.isDefined(this.styleClass)) {
        this.control.className = this.styleClass;
      }
      
      container.appendChild(this.control);      
    }
    this.renderChildren(this.control);
  },
  trackMouseOver: function(menuItem) {
    if (menuItem != this.mouseOverItem) {
      // Clear the existing timeout function if it's set
      if (this.mouseOverTimeout) {
        clearTimeout(this.mouseOverTimeout);
        this.mouseOverTimeout = null;
      }
      
      // Set the new item
      this.mouseOverItem = menuItem;
      
      // Create a new timeout
      var that = this;
      var cb = function() {
        that.mouseOverCallback(menuItem);      
      }
      this.mouseOverTimeout = setTimeout(cb, 300);
    }
  },
  mouseOverCallback: function(menuItem) {
    if (menuItem == this.mouseOverItem && menuItem != this.selectedMenuItem) {
      this.selectItem(menuItem);
    }
  },
  selectItem: function(menuItem) {
    var open = this.isOpen();
    
    if (this.selectedMenuItem != null && 
        this.selectedMenuItem != menuItem && 
        menuItem.parent != this.selectedMenuItem) {
      var i = this.selectedMenuItem;
      while (i != menuItem.parent) {
        i.unselect();
        i = i.parent;
      } 
    } 
    
    if (this.selectedMenuItem == menuItem) {
      menuItem.unselect();
      this.selectedMenuItem = this.selectedMenuItem.parent != this ? this.selectedMenuItem.parent : null;
    } else {
      menuItem.select();
      this.selectedMenuItem = menuItem;
    }
    
    // If the menu wasn't open before but is down, chain a mousedown event on the document body 
    // that will close the menu
    if (!open && this.isOpen()) {
      org.xwidgets.core.MenuBar.openMenu = this;
      xw.Sys.chainEvent(document.body, "mousedown", org.xwidgets.core.MenuBar.documentMouseDown);
    }
  },
  isOpen: function() {
    return this.selectedMenuItem != null;
  },
  close: function() {
    if (this.selectedMenuItem != null) {
      var i = this.selectedMenuItem;
      while (i != this) {
        i.unselect();
        i = i.parent;
      }
    
      this.selectedMenuItem = null;
    }
  }
  
});

org.xwidgets.core.MenuBar.openMenu = null;

org.xwidgets.core.MenuBar.documentMouseDown = function(event) {
  org.xwidgets.core.MenuBar.openMenu.close();
  xw.Sys.unchainEvent(document.body, "mousedown", org.xwidgets.core.MenuBar.documentMouseDown);
  xw.Sys.cancelEventBubble(event);
};
