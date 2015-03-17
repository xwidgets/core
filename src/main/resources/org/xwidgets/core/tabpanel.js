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
  },
  setActive: function() {
    this.parent.setActiveTab(this);
  }
});

org.xwidgets.core.DefaultTabRenderer = function(tabPanel) {
  this.tabPanel = tabPanel;

};

org.xwidgets.core.DefaultTabRenderer.prototype.render = function(container) {
  for (var i = 0; i < this.tabPanel.tabs.length; i++) {
    var tab = this.tabPanel.tabs[i];
    
    tab.tabDiv = document.createElement("div");
    tab.tabDiv.style.cssFloat = "left";
    tab.tabDiv.style.whiteSpace = "nowrap";
    tab.tabDiv.style.cursor = "pointer";
    if (this.tabPanel.activeTab == tab) {
      this.setActive(tab);
    }
    tab.tabDiv.appendChild(document.createTextNode(tab.control.name.value));
    var createCallback = function(tab) {
      return function(event) {
        tab.control.setActive();
        event.preventDefault();      
      }
    };
    xw.Sys.chainEvent(tab.tabDiv, "click", createCallback(tab));
    container.appendChild(tab.tabDiv);
  };
  
  this.tabPanel.repositionContent();
};

org.xwidgets.core.DefaultTabRenderer.prototype.setInactive = function(tab) {
  tab.tabDiv.className = "";
};

org.xwidgets.core.DefaultTabRenderer.prototype.setActive = function(tab) {
  tab.tabDiv.className = this.tabPanel.activeTabStyle.value;
};

org.xwidgets.core.TabPanel = xw.Visual.extend({
  _constructor: function() {
    this.registerProperty("headerStyle", {default: "tabHeader"});
    this.registerProperty("contentStyle", {default: "tabContent"});
    this.registerProperty("activeTabStyle", {default: "active"});
    this.registerEvent("beforeScroll");
    this.tabRenderer = new org.xwidgets.core.DefaultTabRenderer(this);
    this.headerControl = null;
    this.contentControl = null;
    this.control = null;
    this.activeTab = null;
    this.tabs = [];
  },
  render: function(container) {
    if (this.control == null) {     
      this.control = document.createElement("div");
      this.control.style.position = "relative";
      this.control.style.height = "100%";
      if (this.styleClass.value != null) {
        this.control.className = this.styleClass.value;
      }
      container.appendChild(this.control);
      
      this.headerControl = document.createElement("div");
      this.headerControl.className = this.headerStyle.value;
      this.headerControl.style.overflow = "hidden";
      this.headerControl.style.position = "relative";
      this.headerControl.style.width = "100%";
      this.control.appendChild(this.headerControl);
      
      this.contentControl = document.createElement("div");
      this.contentControl.className = this.contentStyle.value;
      this.contentControl.style.clear = "both";
      this.contentControl.style.overflow = "auto";
      this.contentControl.style.position = "absolute";
      this.contentControl.style.left = "0px";
      this.contentControl.style.right = "0px";
      this.contentControl.style.bottom = "0px";
      this.control.appendChild(this.contentControl);
               
      for (var i = 0; i < this.children.length; i++) {
        var tab = {control: this.children[i], container: document.createElement("div")};
        this.tabs[i] = tab;
        if (i === 0) {
          this.activeTab = tab;
          tab.container.style.display = "block";
        } else {
          tab.container.style.display = "none";
        }
        this.contentControl.appendChild(tab.container);
        this.children[i].render(tab.container);
      }    
    } 
    
    this.tabRenderer.render(this.headerControl);      
  },
  repositionContent: function() {
    this.contentControl.style.top = (this.headerControl.offsetHeight -1) + "px";  
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
    } else if (idx instanceof org.xwidgets.core.Tab) {
      for (var i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].control == idx) {
          tab = this.tabs[i];
          break;
        }
      }    
    } else if (idx != this.getActiveTabIndex() && idx >= 0 && idx < this.tabs.length) {
      tab = this.tabs[idx];
    }
    
    if (tab != null && tab != this.activeTab) {
      this.activeTab.container.style.display = "none";
      this.tabRenderer.setInactive(this.activeTab);
      tab.container.style.display = "block";
      this.activeTab = tab;
      this.tabRenderer.setActive(tab);
      
      if (xw.Sys.isDefined(this.activeTab.control.onActivate)) {
        this.activeTab.control.onActivate.invoke(tab);
      }
    }  
  },
  toString: function() {
    return "org.xwidgets.core.TabPanel[" + this.id.value + "]";
  }
});
//# sourceURL=tabpanel.js

