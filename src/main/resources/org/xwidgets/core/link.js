package("org.xwidgets.core");

org.xwidgets.core.Link = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("caption", {default: ""});
    this.registerProperty("styleClass", {default: ""});
    this.registerEvent("onclick", null);
    this.control = null;
  },
  render: function(container) {
    if (this.control == null) {  
      this.control = document.createElement("a");
      this.control.className = this.styleClass.value;
      if (xw.Sys.isDefined(this.caption.value)) {
        this.control.appendChild(document.createTextNode(this.caption.value));
      }
      this.control.href = "#";
      this.addEvent(this.control, "click", this.onclick);
      container.appendChild(this.control);
      
      this.renderChildren(this.control);
    }
  }
});
//# sourceURL=link.js    
