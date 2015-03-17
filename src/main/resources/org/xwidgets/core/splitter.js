package("org.xwidgets.core");

org.xwidgets.core.Splitter = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("orientation", {default: "vertical"});
    this.registerProperty("splitterClass", {default: null});
    this.control = null;
    this.first = null;
    this.second = null;
    this.splitter = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("div");
      this.control.style.height = "100%";
      container.appendChild(this.control);
      
      this.first = document.createElement("div");
      this.first.style.cssFloat = "left";
      this.first.style.height = "100%";
      this.first.style.width = "300px";
      this.first.style.overflow = "auto";
      this.control.appendChild(this.first);
      
      this.splitter = document.createElement("div");
      this.splitter.style.cssFloat = "left";
      this.splitter.style.height = "100%";
      if (this.splitterClass.value != null) {
        this.splitter.className = this.splitterClass.value; 
      } else {
        this.splitter.style.width = "5px";
      }
      this.control.appendChild(this.splitter);
      var that = this;
      var cb = function(event) {
        that.startDragging(event);
      };
      xw.Sys.chainEvent(this.splitter, "mousedown", cb);
      
      this.second = document.createElement("div");
      this.second.style.overflow = "hidden";
      this.second.style.height = "100%";
      this.control.appendChild(this.second);

      if (this.children.length != 2) {
        xw.Log.error("Error - splitter control should have exactly 2 children");
      } 
      
      if (this.children.length >= 1) {
        this.renderChild(this.children[0], this.first);
      }
      
      if (this.children.length >= 2) {
        this.renderChild(this.children[1], this.second);
      }
    }
  },
  startDragging: function(event) {
    this.startDragPosition = event.clientX;
    this.startFirstWidth = this.first.offsetWidth;
    
    var that = this;
    this.mouseUpCallback = function(event) {
      that.stopDragging(event);
    };
    this.mouseMoveCallback = function(event) {
      that.drag(event);
    };
    xw.Sys.chainEvent(document, "mouseup", this.mouseUpCallback);
    xw.Sys.chainEvent(document, "mousemove", this.mouseMoveCallback);
  },
  drag: function(event) {
    var delta = this.startDragPosition - event.clientX;
    var newWidth = this.startFirstWidth - delta;
    if (newWidth > 20) {
      this.first.style.width = newWidth + "px";
    }
    event.preventDefault();
  },
  stopDragging: function(event) {
    xw.Sys.unchainEvent(document, "mouseup", this.mouseUpCallback);
    xw.Sys.unchainEvent(document, "mousemove", this.mouseMoveCallback);
  },
  destroy: function() {
    
  }
});
//# sourceURL=splitter.js

