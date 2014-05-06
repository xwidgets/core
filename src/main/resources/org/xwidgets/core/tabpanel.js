package("org.xwidgets.core");

org.xwidgets.core.Tab = xw.Visual.extend({
  _constructor: function() {
    this.container = null;
    this.registerProperty("name", {default: null});
    this.registerProperty("enabled", {default: true});
    this.registerEvent("onActivate");
  },
  render: function(container) {
    if (this.container == null) {
      this.container = container;
      this.renderChildren(this.container);
    }
  }
});

org.xwidgets.core.TabPanel = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("styleClass", {default: null});
    this.registerEvent("beforeScroll");
    this.control = null;
    this.activeTab = null;
    this.tabs = [];
  },
  render: function(container) {
    if (this.control == null) {  
      this.control = document.createElement("div");
      if (this.styleClass.value != null) {
        this.control.className = this.styleClass.value;
      }
      container.appendChild(this.control);  
          
      for (var i = 0; i < this.children.length; i++) {
        var tab = {control: this.children[i], container: document.createElement("div"), };
        this.tabs[i] = tab;
        if (i === 0) {
          this.activeTab = tab;
          tab.container.style.display = "block";
        } else {
          tab.container.style.display = "none";
        }

        this.control.appendChild(tab.container);      
        this.children[i].render(tab.container);
      }    
    }       
  },
  isTabEnabled: function(idx) {
    return this.tabs[idx].control.enabled;
  },
  setEnabled: function(idx, value) {
    var tab = (typeof idx === "string") ? this.getTabByName(idx) : this.tabs[idx];
    if (tab != null) tab.control.enabled = value;
  },
  next: function() {
    if (xw.Sys.isDefined(this.beforeScroll)) {
      this.beforeScroll.invoke(this);
    }
    
    var idx = this.getActiveTabIndex();
    
    if (idx < this.tabs.length - 1) {
      for (var i = idx + 1; i < this.tabs.length; i++) {
        if (this.isTabEnabled(i)) {
          this.setActiveTab(i);
          break;
        };
      }
    }
  },
  previous: function() {
    if (!xw.Sys.isUndefined(this.beforeScroll)) {
      this.beforeScroll.invoke(this);
    }
    
    var idx = this.getActiveTabIndex();
    
    if (idx > 0) {
      for (var i = idx - 1; i >= 0; i--) {
        if (this.isTabEnabled(i)) {
          this.setActiveTab(i);
          break;
        }
      }
    }
  },
  getTabByName: function(name) {
    for (var i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].control.name == name) {
        return this.tabs[i];
      }
    }
  },
  getActiveTabIndex: function() {
    for (var i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i] == this.activeTab) return i;    
    }
    return -1;
  },
  setActiveTab: function(idx) {
    var tab = null;

    if (typeof idx === "string") {
      tab = this.getTabByName(idx);
    } else if (idx != this.getActiveTabIndex() && idx >= 0 && idx < this.tabs.length) {
      tab = this.tabs[idx];
    }
    
    if (tab != null && tab != this.activeTab) {
      this.activeTab.container.style.display = "none";
      tab.container.style.display = "block";
      this.activeTab = tab;
      
      if (xw.Sys.isDefined(this.activeTab.control.onActivate)) {
        this.activeTab.control.onActivate.invoke(tab);
      }
    }  
  },
  toString: function() {
    return "org.xwidgets.core.TabPanel[" + this.id.value + "]";
  }
});
