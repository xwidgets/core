package("org.xwidgets.core");

org.xwidgets.core.VerticalMenu = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("styleClass", {default: "xw_verticalmenu"});
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
      var ul = document.createElement("ul");
      this.control.appendChild(ul);
      container.appendChild(this.control);
    }
    this.propagateChildProperty(org.xwidgets.core.MenuItem, "menu", this);
    this.renderChildren(ul);
  },
  renderItem: function(menuItem, container) {
    if (menuItem.control == null) {
      menuItem.control = document.createElement("li");
      var anchor = document.createElement("a");
      anchor.href = "#";
      anchor.appendChild(document.createTextNode(menuItem.label.value === null ? "" : menuItem.label.value));
      menuItem.control.appendChild(anchor);
      
      if (menuItem.children.length > 0) {
        var icon = document.createElement("i");
        icon.className ="fa fa-caret-right fa-fw";
        menuItem.control.appendChild(icon);
      }
      
      //if (xw.Sys.isDefined(menuItem.styleClass.value)) {
      //  menuItem.control.className = menuItem.styleClass.value;
      //}
      container.appendChild(menuItem.control);

      var clickEvent = function(event) {
        menuItem.click(event);
      }
            
      xw.Sys.chainEvent(menuItem.control, "click", clickEvent);
      
      // Disable default text selection behaviour
      var mouseDownEvent = function(event) {
        xw.Sys.cancelEventBubble(event);
      };
      xw.Sys.chainEvent(menuItem.control, "mousedown", mouseDownEvent);
      
      if (menuItem.children.length > 0) {
        var mouseOverEvent = function(event) {
          menuItem.mouseOver(event);
        }
        xw.Sys.chainEvent(menuItem.control, "mouseover", mouseOverEvent);
      }
    }  
  },
  selectItem: function(menuItem) {
    var open = this.isOpen();
    
    if (this.selectedMenuItem != null && 
        this.selectedMenuItem != menuItem && 
        menuItem.parent != this.selectedMenuItem) {
      var i = this.selectedMenuItem;
      while (i != menuItem.parent) {
        this.renderSelected(i, false);
        i = i.parent;
      } 
    } 
    
    if (this.selectedMenuItem == menuItem) {
      this.renderSelected(menuItem, false);
      this.selectedMenuItem = this.selectedMenuItem.parent != this ? this.selectedMenuItem.parent : null;
    } else {
      this.renderSelected(menuItem, true);
      this.selectedMenuItem = menuItem;
    }
    
    // If the menu wasn't open before but is down, chain a mousedown event on the document body 
    // that will close the menu
    if (!open && this.isOpen()) {
      //org.xwidgets.core.MenuBar.openMenu = this;
      //xw.Sys.chainEvent(document.body, "mousedown", org.xwidgets.core.MenuBar.documentMouseDown);
    }
  },
  removeItem: function(menuItem) {
    if (menuItem.submenuContainer) {
      menuItem.submenuContainer.parentNode.removeChild(menuItem.submenuContainer);
      menuItem.submenuContainer = null;
    }
    if (menuItem.control) {
      menuItem.control.parentNode.removeChild(this.control);
      menuItem.control = null;
    }  
  },
  renderSelected: function(menuItem, selected) {
    if (selected) {
      if (this.children.length > 0) {
        var c = menuItem.submenuContainer;
        if (c == null) {
          c = document.createElement("ul");
          //if (xw.Sys.isDefined(menuItem.submenuStyleClass.value)) {
          //  c.className = menuItem.submenuStyleClass.value;
          //}
          
//          c.style.position = "absolute";
//          c.style.zIndex = 255;       
//          c.style.overflow = "hidden";
          
          menuItem.renderChildren(c);
          
          menuItem.control.appendChild(c);
          menuItem.submenuContainer = c; 
          new xw.Style(c).addClass("open");
        }
        
        var rect = menuItem.control.getBoundingClientRect();        

        /*if (menuItem.parent instanceof org.xwidgets.core.MenuItem) {
          var containerRect = menuItem.parent.submenuContainer.getBoundingClientRect();
          c.style.top = rect.top + "px";
          c.style.left = (containerRect.right + 1) + "px";
        } else {
          c.style.top = (rect.bottom + 1) + "px";
          c.style.left = rect.left + "px";
        }
        
        menuItem.submenuContainer.style.display = "";*/
      }
      if (xw.Sys.isDefined(menuItem.selectedStyleClass.value)) {
        menuItem.control.className = menuItem.selectedStyleClass.value;
      }
    } else {
      if (menuItem.submenuContainer) {
        menuItem.submenuContainer.style.display = "none";  
      }
      if (xw.Sys.isDefined(menuItem.styleClass) && xw.Sys.isDefined(menuItem.styleClass.value)) {
        menuItem.control.className = menuItem.styleClass.value;
      }
    }
  },
  isOpen: function() {
    return this.selectedMenuItem != null;
  },
  close: function() {
    if (this.selectedMenuItem != null) {
      var i = this.selectedMenuItem;
      while (i != this) {
        this.renderSelected(i, false);
        i = i.parent;
      }
    
      this.selectedMenuItem = null;
    }
  }

});

