package("org.xwidgets.core");

org.xwidgets.core.SlideMenu = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerStyles({
      "container": "xw_slidemenu xw_slidemenu_left",
      "has_sub": "has_sub"
    });     
    this.registerProperty("align", {default: "left"});
    this.registerEvent("onclick");
    this.control = null;
    this.selectedMenuItem = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("div");
      this.setStyleClass(this.control, "container");
      var nav = document.createElement("nav");
      this.control.appendChild(nav);
      container.appendChild(this.control);
    }
    this.propagateChildProperty(org.xwidgets.core.MenuItem, "menu", this);
    this.renderChildren(nav);
  },
  toggle: function() {
  	alert("toggled");
  },
  renderItem: function(menuItem, container) {
    if (menuItem.control == null) {
      menuItem.control = document.createElement("li");
      menuItem.control.className = "open";
      var anchor = document.createElement("a");
      anchor.href = "#";
      anchor.appendChild(document.createTextNode(menuItem.label.value === null ? "" : menuItem.label.value));
      menuItem.control.appendChild(anchor);
      
      container.appendChild(menuItem.control);
      var that = this;
      
      var clickEvent = function(event) {
        that.clickItem(menuItem, event);
      }
            
      xw.Sys.chainEvent(menuItem.control, "click", clickEvent);
      
      // Disable default text selection behaviour
      var mouseDownEvent = function(event) {
        xw.Sys.cancelEventBubble(event);
      };
      xw.Sys.chainEvent(menuItem.control, "mousedown", mouseDownEvent);
    }  
  },
  clickItem: function(menuItem, event) {
    xw.Sys.cancelEventBubble(event);
    
    if (menuItem.children.length > 0) {
      this.selectItem(menuItem);
    } else if (menuItem.onclick) {
      menuItem.onclick.invoke(menuItem);
    }
  },
  selectItem: function(menuItem) {   
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
  },
  renderSelected: function(menuItem, selected) {
    if (selected) {
      if (menuItem.children.length > 0) {
        var c = menuItem.submenuContainer;
        if (c == null) {
          c = document.createElement("ul");          
          menuItem.renderChildren(c);
          menuItem.control.appendChild(c);
          menuItem.submenuContainer = c;
        }
        menuItem.submenuContainer.style.display = "";  
      }
    } else {
      if (menuItem.submenuContainer) {
        menuItem.submenuContainer.style.display = "none";  
      }
    }
  },
  removeItem: function(menuItem) {
    if (menuItem.submenuContainer) {
      menuItem.submenuContainer.parentNode.removeChild(menuItem.submenuContainer);
      menuItem.submenuContainer = null;
    }
    if (menuItem.control) {
      menuItem.control.parentNode.removeChild(menuItem.control);
      menuItem.control = null;
    }  
  } 
});
//# sourceURL=slidemenu.js