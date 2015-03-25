package("org.xwidgets.core");

org.xwidgets.core.Fragment = xw.Visual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("rendered", {default: false, onChange: this.doRender});  
    this.childrenRendered = false;
    this.control = null;
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("span");
      container.appendChild(this.control);
      this.doRender(this.rendered);
    }    
  },
  doRender: function(rendered) {
    if (xw.Sys.isUndefined(this.control) || this.control === null) {
      return;
    }
    
    if (xw.Sys.isUndefined(rendered)) {
      xw.Log.debug("fragment rendered variable " + 
        this._registeredProperties["rendered"].binding + 
        " is undefined");
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
//# sourceURL=fragment.js
