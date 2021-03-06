package("org.xwidgets.core");

org.xwidgets.core.PopupMenu = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("styleClass", {default: "xw_popupmenu"});
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
        this.control.style.display = "none";
        this.control.style.position = "absolute";
        this.control.style.zIndex = "255";
      }
      
      document.body.appendChild(this.control);

      this.propagateChildProperty(org.xwidgets.core.MenuItem, "menu", this);
      this.renderChildren(this.control);
    }
  },
  popup: function(event) {
    this.control.style.left = (event.clientX + 8) + "px";    
    this.control.style.visibility = "hidden";
    this.control.style.display = "block";
    var top = (event.clientY - Math.min(this.control.clientHeight / 2));
    this.control.style.top = top < 0 ? "0px" : top + "px";
    this.control.style.visibility = "";
    org.xwidgets.core.PopupMenu.openMenu = this;
    xw.Sys.chainEvent(document.body, "mousedown", org.xwidgets.core.PopupMenu.documentMouseDown);
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
  renderItem: function(menuItem, container) {
  
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
      org.xwidgets.core.PopupMenu.openMenu = this;
      xw.Sys.chainEvent(document.body, "mousedown", org.xwidgets.core.PopupMenu.documentMouseDown);
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
    this.control.style.display = "none";
  }
});

org.xwidgets.core.PopupMenu.openMenu = null;

org.xwidgets.core.PopupMenu.documentMouseDown = function(event) {
  org.xwidgets.core.PopupMenu.openMenu.close();
  xw.Sys.unchainEvent(document.body, "mousedown", org.xwidgets.core.PopupMenu.documentMouseDown);
  xw.Sys.cancelEventBubble(event);
};
//# sourceURL=popupmenu.js
