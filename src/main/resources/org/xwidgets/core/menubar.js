package("org.xwidgets.core");

org.xwidgets.core.MenuBar = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("styleClass", {default: "xw_menubar"});
    this.registerEvent("onclick");
    this.control = null;    
    this.selectedMenuItem = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("div");
      if (xw.Sys.isDefined(this.styleClass.value)) {
        this.control.className = this.styleClass.value;
      }
      container.appendChild(this.control);
    }

    this.propagateChildProperty(org.xwidgets.core.MenuItem, "menu", this);
    this.renderChildren(this.control);
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
