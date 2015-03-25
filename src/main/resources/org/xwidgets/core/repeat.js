package("org.xwidgets.core");

org.xwidgets.core.Surrogate = xw.NonVisual.extend({ 
  _constructor: function(value) {
    this._super();
    this.registerProperty("value", {default: value});
    this.meta = null;
  },
  resolve: function(name) {
    if (name == this.parent.var) {
      return this.value;
    } else if (name == this.parent.metaVar) {
      return this.meta;
    }
  },
  toString: function() {
    return "org.xwidgets.core.Surrogate[]";
  }
});

org.xwidgets.core.Repeat = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("value", {default:null, onChange: this.renderChildren}); 
    this.registerProperty("var", {default: null});
    this.registerProperty("metaVar", {default: "meta"});
    this.control = document.createElement("span");
    this.surrogates = null;
  },  
  render: function(container) {
    container.appendChild(this.control);
    this.renderChildren();
  },
  renderChildren: function() {
    xw.Sys.clearChildren(this.control);

    if (this.value != null) {
      this.surrogates = [];  

      try {
        for (var i = 0; i < this.value.length; i++) {

          var surrogate = new org.xwidgets.core.Surrogate(this.value[i]);          
          surrogate.parent = this;
          surrogate.meta = {};
          // Set the meta variables
          surrogate.meta.first = (i == 0);
          surrogate.meta.last = (i == (this.value.length - 1));
          surrogate.meta.odd = (i % 2);
          surrogate.meta.even = !surrogate.meta.odd;
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
  toString: function() {
    return "org.xwidgets.core.Repeat[]";
  }
});
//# sourceURL=repeat.js

