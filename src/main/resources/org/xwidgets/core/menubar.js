package("org.xwidgets.core");

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
      if (xw.Sys.isDefined(this.styleClass.value)) {
        this.control.className = this.styleClass.value;
      }
      
      container.appendChild(this.control);      
    }
    this.renderChildren(this.control);
  },
  trackMouseOver: function(menuItem) {
    if (menuItem != this.mouseOverItem) {
      // Unselect the currently selected item
      if (this.mouseOverItem != null) {
        this.mouseOverItem.unselect();
      }
    
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
