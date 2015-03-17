package("org.xwidgets.core");

org.xwidgets.core.RichEdit = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("value", {default: null});
    this.registerProperty("enableResize", {default: false});
    this.registerProperty("resizeMaxWidth", {default: -1});
    this.registerEvent("onChange");
    this.control = null;
    this.editor = null;  

    // We'll keep track of the length and use it as a hackish way to detect
    // whether the content has changed
    this.length = 0;
  },
  getValue: function() {
    return xw.Sys.isUndefined(this.editor) ? this.value.value : this.editor.getData();
  },
  render: function(container) {
    if (this.control == null) {
      this.control = document.createElement("div");  
      container.appendChild(this.control);

      if (xw.Sys.isUndefined(window.CKEDITOR)) {
        // Load the source for the editor before rendering it
        var that = this;
        var cb = function() { that.renderEditor(); };
        window.CKEDITOR_BASEPATH = xw.Sys.getBasePath() + "ckeditor/";
        xw.Sys.loadSource(xw.Sys.getBasePath() + "ckeditor/ckeditor.js", cb);
      } else {
        this.renderEditor();
      }
    }
  },
  renderEditor: function() {
    var config = {};   
    config.resize_enabled = this.enableResize;
    if (this.resizeMaxWidth != -1) {
      config.resize_maxWidth = parseInt(this.resizeMaxWidth);
    }
    config.extraPlugins = "syntaxhighlight";
    config.toolbar = "XWidgets";
    config.toolbar_XWidgets = [
      //{ name: 'document', items : [ 'Source','-','Save','NewPage','DocProps','Preview','Print','-','Templates' ] },
      { name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
      { name: 'editing', items : [ 'Find','Replace','-','SelectAll','-','SpellChecker', 'Scayt' ] },
      //{ name: 'forms', items : [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
      '/',
      { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
      { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },
      { name: 'links', items : [ 'Link','Unlink','Anchor' ] },
      { name: 'insert', items : [ 'Image','Table','HorizontalRule','Smiley' ] },
      '/',
      { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
      { name: 'colors', items : [ 'TextColor','BGColor' ] },
      { name: 'tools', items : [ 'Maximize', 'ShowBlocks','-','Code', 'About' ] }
    ];      

    var that = this;
    var event = function() { that.checkChanged(); };
    
    this.editor = CKEDITOR.appendTo(this.control, config, this.value.value);

    this.editor.on("saveSnapshot", event);
    this.editor.on("afterUndo", event);
    this.editor.on("afterRedo", event);
    this.editor.on("afterCommandExec", event);
    
    var editor = this.editor;
    this.editor.on("contentDom", function() {
      editor.document.on("keyup", event);
    });
  },
  checkChanged: function(event) {
    // Fire an onChange event if the length of the content has changed
    if (this.editor.getData().length != this.length) {
      this.length = this.editor.getData().length;
      if (this.onChange) {
        this.onChange.invoke();
      };  
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
//# sourceURL=richedit.js
