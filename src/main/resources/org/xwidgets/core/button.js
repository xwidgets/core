package("org.xwidgets.core");

org.xwidgets.core.Button = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("label", {default: ""});
    this.registerProperty("styleClass");
    this.registerEvent("onclick");
    this.control = null;
    this.textNode = null;    
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("button");
      var span = document.createElement("span");
      span.appendChild(document.createTextNode(this.label === null ? "" : this.label));
      this.control.appendChild(span);
      if (xw.Sys.isDefined(this.styleClass)) {
        this.control.className = this.styleClass;
      }
      container.appendChild(this.control);
      this.addEvent(this.control, "click", this.onclick);
    }  
  },
  setLabel: function(value) {
    this.label = value;
    if (this.textNode !== null) {
      this.textNode.data = this.label === null ? "" : this.label;
    }  
  }
});
