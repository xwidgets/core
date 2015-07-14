package("org.xwidgets.patternfly");

org.xwidgets.patternfly.Dropdown = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("caption");
    this.registerEvent("onclick");
    this.control = null; 
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("div");
      
      this.control.className = "dropdown";
      
      var btn = document.createElement("button");
      btn.className = "btn btn-default dropdown-toggle";
      btn.type = "button";
      btn.id = "dropdownMenu1"; // TODO - generate a unique ID
      btn.setAttribute("data-toggle", "dropdown");
      
      btn.appendChild(document.createTextNode(this.caption === null ? "" : this.caption));
      
      var s = document.createElement("span");
      s.className = "caret";      
      btn.appendChild(s);
      
      this.control.appendChild(btn);
      
      var menu = document.createElement("ul");
      menu.className = "dropdown-menu";
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-labbeledby", "dropdownMenu1");


      this.control.appendChild(menu);
            
      container.appendChild(this.control);
      
      this.propagateChildProperty(org.xwidgets.core.MenuItem, "menu", this);
      this.propagateChildProperty(org.xwidgets.core.MenuDivider, "menu", this);
      this.renderChildren(menu);
    }
  },
  renderItem: function(menuItem, container) {
    if (menuItem.control == null) {
      menuItem.control = document.createElement("li");
      menuItem.control.setAttribute("role", "presentation");
      if (!menuItem.enabled) {
        menuItem.control.className = "disabled";
      }
      var anchor = document.createElement("a");
      anchor.setAttribute("role", "menuitem");
      anchor.tabIndex = -1;
      anchor.href = "#";
      anchor.appendChild(document.createTextNode(menuItem.label === null ? "" : menuItem.label));
      menuItem.control.appendChild(anchor);
      
      container.appendChild(menuItem.control);

      if (menuItem.enabled) {
        var that = this;      
        var clickEvent = function(event) {
          that.clickItem(menuItem, event);
        }
        xw.Sys.chainEvent(menuItem.control, "click", clickEvent);
      }
      
      // Disable default text selection behaviour
      var mouseDownEvent = function(event) {
        xw.Sys.cancelEventBubble(event);
      };
      xw.Sys.chainEvent(menuItem.control, "mousedown", mouseDownEvent);
    }  
  },
  renderDivider: function(divider, container) {
    if (divider.control == null) {
      divider.control = document.createElement("li");
      divider.control.setAttribute("role", "presentation");
      divider.control.className = "divider";
      container.appendChild(divider.control);
    }
  },
  clickItem: function(menuItem, event) {
//    xw.Sys.cancelEventBubble(event);
    
    if (menuItem.children.length > 0) {
      this.selectItem(menuItem);
    } else if (menuItem.onclick) {
      menuItem.onclick.invoke(menuItem);
    } else if (this.onclick) {
      this.onclick.invoke(this, {item: menuItem});
    }
  },
  setCaption: function(value) {
    this.caption = value;
    //if (this.textNode !== null) {
    //  this.textNode.data = this.label === null ? "" : this.label;
    //}  
  },
  disable: function(value) {
    this.control.disabled = true;
  },
  enable: function(value) {
    this.control.disabled = false;
  },
  toString: function() {
    return "org.xwidgets.patternfly.Dropdown[" + this.caption + "]";
  }
});
//# sourceURL=dropdown.js
