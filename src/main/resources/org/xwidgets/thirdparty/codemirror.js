package("org.xwidgets.thirdparty");

org.xwidgets.thirdparty.CodeMirror = xw.Visual.extend({
  _constructor: function() {
    this._super(false);  
    this.registerProperty("value", {default: null});
    this.registerEvent("onChange");
    this.container = null;
    this.editor = null;  
  },
  render: function(container) {
    this.container = container;
    if (this.editor == null) {
      if (xw.Sys.isUndefined(window.CodeMirror)) {
        // Load the source for the editor before rendering it
        var that = this;
        var cb = function() { that.renderEditor(); };
        xw.Sys.loadSource(xw.Sys.getBasePath() + "codemirror-5.3/lib/codemirror.js", cb);
      } else {
        this.renderEditor(container);
      }
    }
  },
  renderEditor: function(container) {
    if (this.editor == null) {
      this.editor = CodeMirror(container);
    }
  },
  destroy: function() {
    this._super();
    if (this.editor != null) {
      this.editor.destroy();
      this.editor = null;
    }
  }
});
//# sourceURL=codemirror.js
