package("org.xwidgets.core");

org.xwidgets.core.Fragment = xw.Visual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("rendered", {default: true, listener: this.doRender});  
    this.childrenRendered = false;
    this.control = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("span");
      container.appendChild(this.control);
      this.doRender(this.rendered.value);
    }    
  },
  doRender: function(rendered) {
    if (xw.Sys.isUndefined(this.control) || this.control === null) {
      return;
    }
    
    if (xw.Sys.isUndefined(rendered)) {
      xw.Log.warn("fragment rendered variable is undefined");
    }    

    if (rendered === true) {
      if (!this.childrenRendered) {
        this.renderChildren(this.control);
        this.childrenRendered = true;
      }
      this.control.style.display = "";
    } else {
      this.control.style.display = "none";
    }
  }
});
