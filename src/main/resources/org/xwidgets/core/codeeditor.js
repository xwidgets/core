package("org.xwidgets.core");

org.xwidgets.core.CodeEditor = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("value", {default: null});
    this.registerProperty("enableResize", {default: false});
    this.registerProperty("resizeMaxWidth", {default: -1});
    this.registerEvent("onChange");
    this.container = null;
    this.editor = null;  
  },
  render: function(container) {
    this.container = container;
    if (this.editor == null) {
      if (xw.Sys.isUndefined(window.ace)) {
        // Load the source for the editor before rendering it
        var that = this;
        var cb = function() { that.renderEditor(); };
        window.ACE_BASEPATH = xw.Sys.getBasePath() + "ace/";
        //xw.Sys.loadSource(xw.Sys.getBasePath() + "ace/ace-full.js", cb);
      } else {
        this.renderEditor();
      }
    }
  },
  renderEditor: function() {
    if (this.editor == null) {
      this.editor = ace.edit(this.container);
//      this.editor.setTheme("ace/theme/monokai");
//      this.editor.getSession().setMode("ace/mode/javascript");
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
