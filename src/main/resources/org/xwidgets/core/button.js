package("org.xwidgets.core");

org.xwidgets.core.Button = xw.Visual.extend({
  _constructor: function() {
    this._super();
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
      span.appendChild(document.createTextNode(this.label.value === null ? "" : this.label.value));
      this.control.appendChild(span);
      
      this.renderChildren(this.control);
      
      if (this.styleClass.isSet()) {
        this.control.className = this.styleClass.value;
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
  },
  disable: function(value) {
    this.control.disabled = true;
  },
  enable: function(value) {
    this.control.disabled = false;
  },
  toString: function() {
    return "org.xwidgets.core.Button[" + this.label.value + "]";
  }
});
//# sourceURL=button.js
