package("org.xwidgets.core");

org.xwidgets.core.InputSearch = xw.Visual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("value", {default: null});    
    this.registerProperty("placeholder", {default: null});
    this.registerProperty("styleClass", {default: null});
    this.registerEvent("onsearch");
    this.control = null;
  },
  getValue: function() {
    return this.control.value;
  },
  render: function(container) {
    if (this.control == null) {
      var that = this;

      this.control = document.createElement("input");
      this.control.type = "text";

      if (this.styleClass.value != null) {
        this.control.className = this.styleClass.value;
      }

      if (this.value.value != null) {
        this.control.value = this.value.value;
      }
      
      if (this.placeholder.value != null) {
        this.control.placeholder = this.placeholder.value;
      }
      
      var that = this;
      this.control.onkeypress = function() {
        that.checkEnter(event);
      };
      
      //var inp = document.createElement("input");
      //inp.type = "submit";
      //inp.style.display = "none";
      
      container.appendChild(this.control);
    }
  },
  checkEnter: function(event) {
    var key;
    if (window.event) {
      key = window.event.keyCode;
    } else if (event) {
      key = event.which;
    }
    
    if (key == 13) {
      if (xw.Sys.isDefined(this.onsearch)) {
        this.onsearch.invoke(this, {searchTerm: this.getValue()});
      }
    }    
  },
  toString: function() {
    return "org.xwidgets.core.InputSearch[" + this.id.value + "]";
  }
});
//# sourceURL=inputsearch.js
