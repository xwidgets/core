package("org.xwidgets.core");

org.xwidgets.core.Radio = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("styleClass", {default: ""});
    this.registerProperty("orientation", {default: "horizontal"});
    this.registerProperty("labelPosition", {default: "left"});
    this.control = null;
    this.name = null;
    this.controls = [];
  },   
  render: function(container) {
    if (this.control == null) {
      this.name = this.id === null ? "radio_" + xw.Sys.uid() : this.id + "_radio";
      this.control = document.createElement("div");
      container.appendChild(this.control);
      this.renderChildren();
    }
  },
  addItem: function(value, label) {
    var inp = document.createElement("input");
    var id = "radio_" + xw.Sys.uid();
    inp.id = id;
    inp.type = "radio";
    inp.name = this.name;
    inp.value = value;  
    inp.className = this.styleClass.value;
    
    // Select the first option
    if (this.controls.length == 0) {
      inp.checked = true;
    }
    
    var lbl = document.createElement("label");
    lbl.htmlFor = id;
    lbl.appendChild(document.createTextNode(label));
    
    if (this.orientation.value === "horizontal") {
      var div = document.createElement("div");
      div.appendChild(inp);
      div.appendChild(lbl);
      this.control.appendChild(div);
    } else {  
      this.control.appendChild(inp);
      this.control.appendChild(lbl);
    }
    
    this.controls.push(inp);
  },
  getValue: function() {
    for (var i = 0; i < this.controls.length; i++) {
      if (this.controls[i].checked) {
        return this.controls[i].value;
      }
    }
  }
});
//# sourceURL=radio.js
