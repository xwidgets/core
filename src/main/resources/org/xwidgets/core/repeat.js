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
    this.registerProperty("metaVar", {default: "meta"});
    this.control = document.createElement("span");
    this.surrogates = null;
    this.meta = null;
  },  
  render: function(container) {
    container.appendChild(this.control);
    this.renderChildren(this.value.value);
  },
  renderChildren: function(value) {
    xw.Sys.clearChildren(this.control);

    if (value != null) {
      this.surrogates = [];  

      try {
        this.meta = {};

        for (var i = 0; i < value.length; i++) {
          // Set the meta variables
          this.meta.first = (i == 0);
          this.meta.last = (i == (value.length - 1));
          this.meta.odd = (i % 2);
          this.meta.even = !this.meta.odd;

          var surrogate = new org.xwidgets.core.Surrogate(this.var.value, value[i]);
          surrogate.parent = this;
          this.surrogates.push(surrogate);
          
          for (var j = 0; j < this.children.length; j++) {
            var clone = this.children[j].clone(surrogate);
            surrogate.children.push(clone);

            clone.render.call(clone, this.control);
          }
        }
      } finally {        
        this.meta = null;
      }
      
      if (this.afterRender) {
        this.afterRender.invoke();
      };     
    }
  },
  resolve: function(name) {
    if (name == this.var.value) {
      return this.value.value;
    } else if (name == this.metaVar.value) {
      return this.meta;
    }
  },
  updateValue: function(value) {
    this.renderChildren(value);
  },
  toString: function() {
    return "org.xwidgets.core.Repeat[]";
  }
});


