package("org.xwidgets.core");

org.xwidgets.core.Form = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("styleClass", {default: ""});
    this.registerEvent("onload");
    this.control = null;
  },   
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("form");
      this.control.className = this.styleClass.value;        
      container.appendChild(this.control);
      
      this.renderChildren(this.control);
      
      if (xw.Sys.isDefined(this.onload)) {
        this.onload.invoke(this);
      }
    }
  },
  focus: function() { 
    for(var i = 0; i < this.control.length; i++) {
      if (this.control[i].type != "hidden") {
        if (this.control[i].disabled != true) {
          this.control[i].focus();
          return;
        }
      }
    }
  },
  reset: function() {
    if (this.control) {
      this.control.reset();
    }
  },
  destroy: function() {
    this._super();
  }
});

