package("org.xwidgets.core");

org.xwidgets.core.Surrogate = xw.NonVisual.extend({ });

org.xwidgets.core.Repeat = xw.Visual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("value", {default:null, elListener: this.updateValue}); 
    this.registerProperty("var", {default: null});
    this.control = document.createElement("span");
    this.currentItem = null;
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

      for (var i = 0; i < this.value.length; i++) {
        this.currentItem = this.value[i];
              
        var surrogate = new org.xwidgets.core.Surrogate();
        surrogate.parent = this;
        this.surrogates.push(surrogate);
        
        for (var j = 0; j < this.children.length; j++) {
          var clone = this.children[j].clone(surrogate);
          surrogate.children.push(clone);

          clone.render(this.control);
        }
      }
      
      if (this.afterRender) {
        this.afterRender.invoke();
      };     
    }
  },
  resolve: function(name) {
    if (name == this.var) {
      return this.currentItem;
    }
  },
  updateValue: function(value) {
    this.value = value;
    this.renderChildren();
  }
});


