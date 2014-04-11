package("org.xwidgets.core");

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
    var m = this.getMenuBar();
    m.selectItem(this);
    if (this.children.length == 0) {
      if (this.onclick) {
        m.close();
        this.onclick.invoke(m);
      } else if (m && m.onclick) {
        m.close();
        m.onclick.invoke(m, {item: this});
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
        if (xw.Sys.isDefined(this.submenuStyleClass.value)) {
          c.className = this.submenuStyleClass.value;
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