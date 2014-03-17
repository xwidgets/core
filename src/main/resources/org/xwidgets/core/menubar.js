package("org.xwidgets.core");

org.xwidgets.core.MenuItem = xw.Visual.extend({
  _constructor: function(label) {
    this._super();
    this.registerProperty("label", {default: label});
    this.registerProperty("rendered");
    this.registerProperty("styleClass", {default: "xw_menuitem"});
    this.registerProperty("submenuStyleClass", {default: "xw_submenu"});
    this.registerProperty("definition", {elListener: this.updateDefinition});
    this.registerEvent("onclick");
    this.control = null;
    this.submenuContainer = null;
    this.submenuOpen = false;
  },
  updateDefinition: function(def) {
    // If the submenu is open, close it
    if (this.submenuOpen) {
      this.submenuContainer.style.display = "none";
      this.submenuOpen = false;
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
    }
  },
  click: function(event) {
    if (this.children.length > 0) {
      this.toggleSubmenu();
    } else if (this.onclick) {
      this.onclick(event);
    }
  },
  toggleSubmenu: function() {
    if (this.submenuOpen) {
      this.submenuContainer.style.display = "none";
    } else {
      var c = this.submenuContainer;
      if (c == null) {
        c = document.createElement("div");
        if (xw.Sys.isDefined(this.submenuStyleClass)) {
          c.className = this.submenuStyleClass;
        }
        
        c.style.position = "absolute";
        c.style.zIndex = 10;
        
        var rect = this.control.getBoundingClientRect();        

        c.style.top = (rect.bottom + 1) + "px";  
        c.style.left = rect.left + "px";
        c.style.overflow = "hidden";
        
        this.renderChildren(c);
        
        document.body.appendChild(c);
        this.submenuContainer = c;
      } else {
        this.submenuContainer.style.display = "";
      }
    }
    this.submenuOpen = !this.submenuOpen;
  }
});

org.xwidgets.core.MenuBar = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("styleClass", {default: "xw_menubar"});
    this.control = null;    
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
  }
});
