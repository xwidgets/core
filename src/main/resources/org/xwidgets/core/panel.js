package("org.xwidgets.core");

//
// Defines the physical bounds of a control
//
xw.Bounds = function(top, left, height, width) {
  this.top = top;
  this.left = left;
  this.height = height;
  this.width = width;
  this.style = new Object();
  
  xw.Bounds.prototype.getTop = function() {
    return this.top;
  };
  
  xw.Bounds.prototype.getLeft = function() {
    return this.left;
  };
  
  xw.Bounds.prototype.getHeight = function() {
    return this.height;
  };
  
  xw.Bounds.prototype.getWidth = function() {
    return this.width;
  };
  
  xw.Bounds.prototype.addStyleProperty = function(property, value) {
    this.style[property] = value;
    return this;
  };
};


xw.BorderLayout = function() {
  this.bounds = [];

  xw.BorderLayout.prototype.calculate = function(widgets) {
    var i;
    var controls = {      
      top: [],
      bottom: [],
      left: [],
      right: [],
      client: [] 
    };
    var spacing = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };

    // TODO - support percentage widths

//    container.style.position = "relative";
    
//    xw.Sys.getStyle(container, "position")

    for (i = 0; i < widgets.length; i++) {
      var w = widgets[i];
      if (controls[w.align]) {
        controls[w.align].push(w);
      }
    }

    for (i = 0; i < controls.top.length; i++) {
      var b = new xw.Bounds(null, null, controls.top[i].height, null);
      b.addStyleProperty("position", "absolute")
      b.addStyleProperty("top", spacing.top + "px")
      b.addStyleProperty("left", "0")
      b.addStyleProperty("right", "0");

      this.bounds.push({control: controls.top[i], bounds: b});
      spacing.top += 1.0 * controls.top[i].height;
    }

    for (i = 0; i < controls.bottom.length; i++) {
      var b = new xw.Bounds(null, null, controls.bottom[i].height, null);
      b.addStyleProperty("position","absolute")
      b.addStyleProperty("bottom", spacing.bottom)
      b.addStyleProperty("left", "0")
      b.addStyleProperty("right", "0");

      this.bounds.push({control: controls.bottom[i], bounds: b});
      spacing.bottom += 1.0 * controls.bottom[i].height;
    }

    for (i = 0; i < controls.left.length; i++) {
      var b = new xw.Bounds(null, null, null, controls.left[i].width);
      b.addStyleProperty("position", "absolute")
      b.addStyleProperty("left", spacing.left + "px")
      b.addStyleProperty("top", spacing.top + "px")
      b.addStyleProperty("bottom", spacing.bottom + "px");
      
      this.bounds.push({control: controls.left[i], bounds: b});
      spacing.left += 1.0 * controls.left[i].width;
    }

    for (i = 0; i < controls.right.length; i++) {
      var b = new xw.Bounds(null, null, null, controls.right[i].width);
      b.addStyleProperty("position", "absolute")
      b.addStyleProperty("right", spacing.right + "px")
      b.addStyleProperty("top", spacing.top + "px")
      b.addStyleProperty("bottom", spacing.bottom + "px");
      
      this.bounds.push({control: controls.right[i], bounds: b});
      spacing.right += 1.0 * controls.right[i].width;
    }

    for (i = 0; i < controls.client.length; i++) {
      var b = new xw.Bounds(null, null, null, null);
      b.addStyleProperty("position", "absolute")
      b.addStyleProperty("left", spacing.left + "px")
      b.addStyleProperty("right", spacing.right + "px")
      b.addStyleProperty("top", spacing.top + "px")
      b.addStyleProperty("bottom", spacing.bottom + "px");
      
      this.bounds.push({control: controls.client[i], bounds: b});
    }
  };

  xw.BorderLayout.prototype.getBounds = function(ctl) {
    for (var i = 0; i < this.bounds.length; i++) {
      if (this.bounds[i].control == ctl) {
        return this.bounds[i].bounds;
      }
    }
    return null;
  };
};

org.xwidgets.core.Panel = xw.Container.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("align", {default: "left"});
    this.registerProperty("width", {default: 200});
    this.registerProperty("height", {default: 100});
    this.control = null;
    this.inner = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("div");
      this.control.widget = this;              
      this.control.style.backgroundColor = "#ece9d6";
       
      // TODO make the border more configurable (or allow it to be turned off etc)
      this.control.style.borderTop = "1px solid white"; //white
      this.control.style.borderLeft = "1px solid white"; //white
      this.control.style.borderBottom = "1px solid #555555";
      this.control.style.borderRight = "1px solid #555555";
      
      this.control.style.padding = "0px";
      this.control.style.margin = "0px";
       
      if (this.parent.layout != null) {
        var bounds = this.parent.layout.getBounds(this);
        if (bounds != null) this.applyBounds(bounds);
      } else {
        this.control.style.width = this.width;
        this.control.style.height = this.height;         
        this.control.style.display = "inline-block";
      }

      container.appendChild(this.control);
    }    
        
    if (this.inner == null) {
      this.inner = document.createElement("div");
      this.inner.widget = this;
      this.inner.style.width = "100%";
      this.inner.style.height = "100%";
      this.inner.style.position = "relative";
      this.inner.style.border = "0px";    
      this.control.appendChild(this.inner);      
    }
     
     // FIXME
    // Create the appropriate layout manager and layout the child controls
    //if (this.layoutManager == null && this.layout != null) {
  //    this.layoutManager = new xw.layoutManagers[this.layout](this);  
    //} else {
      this.layout = new xw.BorderLayout(this);
    //}
      
    this.layout.calculate(this.children);
    
    this.renderChildren(this.inner);
  },
  appendChild: function(child) {
    this.inner.appendChild(child);
  },
  applyBounds: function(bounds) {  
    if (bounds.left != null) this.control.style.left = bounds.left + "px";
    if (bounds.top != null) this.control.style.top = bounds.top + "px";
    
    for (var i in bounds.style) this.control.style[i] = bounds.style[i];

    var b = xw.Sys.getBorder(this.control);
   
    if (bounds.height != null) {
      if (("" + bounds.height).indexOf("%") == -1) {
        this.control.style.height = (bounds.height - b.top - b.bottom) + "px";
      }
      else {
        this.control.style.height = bounds.height;
      }
    }
    
    if (bounds.width != null) {
      if (("" + bounds.width).indexOf("%") == -1) {
        this.control.style.width = (bounds.width - b.left - b.right) + "px";
      }
      else {
        this.control.style.width = bounds.width;
      }
    }
  },
  toString: function() {
    return "org.xwidgets.core.Panel[" + this.id + "]";
  }    
});
//# sourceURL=panel.js
