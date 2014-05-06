package("org.xwidgets.core");

org.xwidgets.core.Splitter = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("orientation", {default: "vertical"});
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
      this.control.appendChild(this.first);
      
      this.splitter = document.createElement("div");
      this.splitter.style.cssFloat = "left";
      this.splitter.style.height = "100%";
      this.splitter.style.width = "5px";
      this.control.appendChild(this.splitter);
      
      this.second = document.createElement("div");
//      this.second.style.cssFloat = "left";
      this.second.style.overflow = "hidden";
      this.second.style.height = "100%";
//      this.second.style.width = "400px";
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
  destroy: function() {
    
  }
});


