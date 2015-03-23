package("org.xwidgets.core");

org.xwidgets.core.SlideMenu = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerStyles({
      "container": "xw_slidemenu",
      "has_sub": "has_sub"
    });     
    this.registerProperty("align", {default: "left", onChange: this.updateStyle});
    this.registerProperty("width", {default: 300, onChange: this.updateStyle});
    this.registerProperty("height", {default: 300, onChange: this.updateStyle});
    this.registerEvent("onclick");
    this.control = null;
    this.mask = null;
    this.selectedMenuItem = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("div");
      this.setStyleClass(this.control, "container");
      var nav = document.createElement("nav");
      this.control.appendChild(nav);

      this.updateStyle();

      container.appendChild(this.control);
      
      this.mask = document.createElement("div");
      this.mask.style.position = "fixed";
      this.mask.style.top = "0px";
      this.mask.style.left = "0px";
      this.mask.style.zIndex = 15;
      this.mask.style.width = "100%";
      this.mask.style.height = "100%";
      this.mask.style.background = "rgba(0, 0, 0, 0.8)";
      var that = this;
      xw.Sys.chainEvent(this.mask, "click", function() {
      	that.closeMenu();
      });
    }
    this.propagateChildProperty(org.xwidgets.core.MenuItem, "menu", this);
    this.renderChildren(nav);
  },
  toggle: function() {
  	document.body.appendChild(this.mask);
  	if (this.align == "left") {
    	this.control.style.left = "0px";
    } else if (this.align == "right") {
      this.control.style.right = "0px";
    }
  },
  closeMenu: function() {
    document.body.removeChild(this.mask);
    if (this.align == "left") {
      this.control.style.left = "-" + this.width + "px";
    } else if (this.align == "right") {
      this.control.style.right = "-" + this.width + "px";
    }
  },
  updateStyle: function() {
  	if (this.control != null) {
      var s = this.control.style;
      
      if (this.align == "left") {
        s.top = 0;
        s.width = this.width + "px";
        s.height = "100%";
        s.left = "-" + this.width + "px";
    	} else if (this.align == "right") {
        s.top = 0;
        s.width = this.width + "px";
        s.height = "100%";
        s.left = "";
        s.right = "-" + this.width + "px";  		
    	}
    }
  },
  renderItem: function(menuItem, container) {
    if (menuItem.control == null) {
      menuItem.control = document.createElement("li");
      menuItem.control.className = "open";
      var anchor = document.createElement("a");
      anchor.href = "#";
      anchor.appendChild(document.createTextNode(menuItem.label === null ? "" : menuItem.label));
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
  },
  toString: function() {
    return "org.xwidgets.core.SlideMenu[]";	
  }
});
//# sourceURL=slidemenu.js
