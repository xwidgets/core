package("org.xwidgets.core");

org.xwidgets.core.Surrogate = xw.NonVisual.extend({ 
  _constructor: function(name, value) {
    this._super();
    this.registerProperty("name", {default: name});
    this.registerProperty("value", {default: value});
  },
  resolve: function(name) {
    if (name == this.name.value) {
      return this.value.value;
    }
  },
  toString: function() {
    return "org.xwidgets.core.Surrogate[]";
  }
});

org.xwidgets.core.Repeat = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("value", {default:null, listener: this.updateValue}); 
    this.registerProperty("var", {default: null});
    this.control = document.createElement("span");
    this.surrogates = null;
  },  
  render: function(container) {
    container.appendChild(this.control);
    this.renderChildren(this.value.value);
  },
  renderChildren: function(value) {
    xw.Sys.clearChildren(this.control);

    if (value != null) {
      this.surrogates = [];  

      for (var i = 0; i < value.length; i++) {              
        var surrogate = new org.xwidgets.core.Surrogate(this.var.value, value[i]);
        surrogate.parent = this;
        this.surrogates.push(surrogate);
        
        for (var j = 0; j < this.children.length; j++) {
          var clone = this.children[j].clone(surrogate);
          surrogate.children.push(clone);

          clone.render.call(clone, this.control);
        }
      }
      
      if (this.afterRender) {
        this.afterRender.invoke();
      };     
    }
  },
  resolve: function(name) {
    if (name == this.var.value) {
      return this.value.value;
    }
  },
  updateValue: function(value) {
    this.renderChildren(value);
  },
  toString: function() {
    return "org.xwidgets.core.Repeat[]";
  }
});


