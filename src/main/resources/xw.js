/**
 * Core XWidgets framework
 * @author Shane Bryzak
 */
function package(fullName) {
  var i;
  var pkg = window;
  var parts = fullName.split(".");
  for (i = 0; i < parts.length; i++) {
    if (typeof pkg[parts[i]] === "undefined") {
      pkg[parts[i]] = {};
    }
    pkg = pkg[parts[i]];
  }
};

// XWidgets namespace
var xw = {
  // Global variables
  basePath: null,
  viewPath: "views/",
  // Constants
  CORE_NAMESPACE: "http://xwidgets.org/core",
  XHTML_NAMESPACE: "http://www.w3.org/1999/xhtml",
  // Methods
  Browser: function() {
    var ua = navigator.userAgent;
    var isOpera = Object.prototype.toString.call(window.opera) === '[object Opera]';
    return {
      IE:             !!window.attachEvent && !isOpera,
      Opera:          isOpera,
      WebKit:         ua.indexOf('AppleWebKit/') > -1,
      Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
      MobileSafari:   /Apple.*Mobile.*Safari/.test(ua)
    }
  }
};

//
// System Utils
//
xw.Sys = {
  // Track any sources that have been already loaded, don't load again
  loadedSources: [],
  getObject: function(id) {
    if (document.getElementById && document.getElementById(id)) {
      return document.getElementById(id);
    } else if (document.all && document.all(id)) {
      return document.all(id);
    } else if (document.layers && document.layers[id]) {
      return document.layers[id];
    } else {
      return null;
    }
  },
  getWidget: function(id) {
    for (var i = 0; i < xw.Controller.activeDataModules.length; i++) {
      var dm = xw.Controller.activeDataModules[i];
      var w = dm.getWidgetById(id);
      if (xw.Sys.isDefined(w)) {
        return w;
      }
    }
    return undefined;
  },
  createHttpRequest: function(mimeType) {
    if (window.XMLHttpRequest) {
      var req = new XMLHttpRequest();
      if (mimeType !== null && req.overrideMimeType) {
        req.overrideMimeType(mimeType);
      }
      return req;
    }
    else {
      return new ActiveXObject("Microsoft.XMLHTTP");
    }
  },
  //
  // Asynchronously loads the javascript source from the specified url
  //   callback - the callback function to invoke if successful
  //   failCallback = the callback function to invoke if loading failed
  //
  loadSource: function(url, callback, failCallback) {
    if (!xw.Array.contains(xw.Sys.loadedSources, url)) {
      xw.Sys.loadedSources.push(url);
      xw.Log.debug("xw.Sys: Loading source [" + url + "]");
      var req = xw.Sys.createHttpRequest("text/plain");
      req.onreadystatechange = function() {
        if (req.readyState === 4) {
          if (req.status === 200 || req.status === 0) {
            var e = document.createElement("script");
            e.language = "javascript";
            e.text = req.responseText;
            e.type = "text/javascript";
            var head = document.getElementsByTagName("head")[0];
            if (head === null) {
              head = document.createElement("head");
              var html = document.getElementsByTagName("html")[0];
              html.insertBefore(head, html.firstChild);
            }
            try {
              head.appendChild(e);           
            } catch (err) {
              throw "There was an error loading the script from '" + url + "': " + err;
              return;
            }
            if (callback) {
              callback(url);
            }               
          } else if (req.status === 404) {
            xw.Log.warn("404 error: the requested resource '" + url + "' could not be found.");
            if (failCallback) {
              failCallback();
            }
          }
        }
      };

      req.open("GET", url, true);
      try {
        req.send(null);
      } catch (e) {
        xw.Log.error("Error loading source: " + e);
      }
    }
  },
  getBasePath: function() {
    if (xw.basePath === null) {
      var scripts = document.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) {
        var match = scripts[i].src.match( /(^|.*[\\\/])xw.js(?:\?.*)?$/i );
        if (match) {
          xw.basePath = match[1];
          break;
        }
      }
    }
    
    // Create an EL binding for the basePath
    xw.EL.registerResolver({
      canResolve: function(expr) {
        return "basePath" == expr;
      },
      resolve: function(expr) {
        return "basePath" == expr ? xw.basePath : undefined;
      }
    });
    
    return xw.basePath;
  },
  newInstance: function(name) {
    var current, parts, constructorName;
    parts = name.split('.');
    constructorName = parts[parts.length - 1];
    current = window;
    for (var i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    if (xw.Sys.isUndefined(current[constructorName])) {
      throw "Could not create new widget instance, widget [" + name + "] is undefined.";
    } else {
      return new current[constructorName]();
    }
  },
  isUndefined: function(value) {
    return value == null && value !== null;
  },
  isDefined: function(value) {
    return !xw.Sys.isUndefined(value);
  },
  classExists: function(fqcn) {
    var parts = fqcn.split(".");
    var partial = "";
    var i;
    for (i = 0; i < parts.length; i++) {
      partial += (i > 0 ? "." : "") + parts[i];
      if (eval("typeof " + partial) === "undefined") return false;
    }
    
    return eval("typeof " + fqcn) === "function";
  },
  cloneObject: function(o) {
    if (xw.Sys.isUndefined(o)) {
      return undefined;
    } else if (o instanceof xw.Widget) {
      return o.clone();
    } else if (o == null || typeof(o) != 'object') {
      return o;
    }
    var n = new o.constructor();
    for (var key in o) {
      n[key] = xw.Sys.cloneObject(o[key]);
    }
    return n;
  },
  trim: function(value) {
    return value.replace(/^\s+|\s+$/g,"");
  },
  objectSize: function(value) {
    var size = 0, key;
    for (key in value) {
      if (value.hasOwnProperty(key)) size++;
    }
    return size;
  },
  capitalize: function(value) {
    return value.substring(0, 1).toUpperCase() + value.substring(1, value.length);
  },
  chainEvent: function(ctl, eventName, eventFunc) {
    if (ctl.addEventListener) {
      // normal browsers like firefox, chrome and safari support this
      ctl.addEventListener(eventName, eventFunc, false);
    }
    else if (ctl.attachEvent) {
      // irregular browsers such as IE don't support standard functions
      ctl.attachEvent("on" + eventName, eventFunc);
    }
    else {
      // really old browsers
      throw "your browser doesn't support adding event listeners";
    }
  },
  unchainEvent: function(ctl, eventName, eventFunc) {
    if (ctl.detachEvent) {
      ctl.detachEvent("on" + eventName, eventFunc);
    } else if (ctl.removeEventListener) {
      ctl.removeEventListener(eventName, eventFunc, false);
    } else {
      throw "Your browser doesn't support removing event listeners";
    }
  },
  cancelEventBubble: function(event) {
    if (navigator.userAgent.indexOf("MSIE") != -1) {
      window.event.cancelBubble = true;
      window.event.returnValue = false;
    } else {
      event.preventDefault();
    }
    
    if (event.stopPropagation) {
      event.stopPropagation();
    }
  },
  endsWith: function(value, suffix) {
    return value.indexOf(suffix, value.length - suffix.length) !== -1;
  },
  uid: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },
  getBorder: function(control) {
    var border = {};
    if (window.navigator.userAgent.indexOf('Safari') === -1) {
      if (control.currentStyle) {
        border.top = parseInt(control.currentStyle.borderTopWidth, 10);
        border.right = parseInt(control.currentStyle.borderRightWidth, 10);
        border.bottom = parseInt(control.currentStyle.borderBottomWidth, 10);
        border.left = parseInt(control.currentStyle.borderLeftWidth, 10);
      }
      else {
        try {
          border.top = parseInt(getComputedStyle(control,null).getPropertyValue('border-top-width'), 10);
          border.right = parseInt(getComputedStyle(control,null).getPropertyValue('border-right-width'), 10);
          border.bottom = parseInt(getComputedStyle(control,null).getPropertyValue('border-bottom-width'), 10);
          border.left = parseInt(getComputedStyle(control,null).getPropertyValue('border-left-width'), 10);
        }
        // last resort
        catch (e) {
          border.top = parseInt(control.style.borderTopWidth, 10);
          border.right = parseInt(control.style.borderRightWidth, 10);
          border.bottom = parseInt(control.style.borderBottomWidth, 10);
          border.left = parseInt(control.style.borderLeftWidth, 10);
        }
      }
    }
    else {
      border.top = parseInt(control.style.getPropertyValue('border-top-width'), 10);
      border.right = parseInt(control.style.getPropertyValue('border-right-width'), 10);
      border.bottom = parseInt(control.style.getPropertyValue('border-bottom-width'), 10);
      border.left = parseInt(control.style.getPropertyValue('border-left-width'), 10);
    }
    return border;
  },
  parseXml: function(body) {
    var doc;
    try {
      doc = new ActiveXObject("Microsoft.XMLDOM");
      doc.async = "false";
      doc.loadXML(body);
      return doc;
    }
    catch (e) {
      doc = new DOMParser().parseFromString(body, "text/xml");
      return doc;
    }
  },
  clearChildren: function(e) {
    while (xw.Sys.isDefined(e) && e.hasChildNodes()) {
      e.removeChild(e.firstChild);
    }
  }
};

xw.Array = {
  contains: function(arr, value) {
    var i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        return true;
      }
    }
    return false;
  },
  remove: function(arr, value) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i] == value) arr.splice(i,1);
    }  
  },
  //
  // Deletes the elements from an array that meet the specified condition
  //
  deleteElements: function(arr, condition) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (condition(arr[i])) arr.splice(i,1);
    }
  },
  iterate: function(arr, func) {
    for (var i = 0; i < arr.length; i++) {
      func(arr[i]);
    }
  }
};

//
// Logging
//

xw.Log = {
  levels: {
    ALL: 0,
    DEBUG: 100,
    INFO: 200,
    WARN: 300,
    ERROR: 400,
    OFF: 500
  },
  logLevel: "ERROR",
  append: function(text, logLevel) {
    var msg = {
      text : text,
      logLevel : logLevel,
      timestamp : new Date()
    };
    if (xw.Log.levels[logLevel] >= xw.Log.levels[xw.Log.logLevel]) {
      var formattedMsg = xw.Log.format(msg);
      console.log(formattedMsg);
    }
  },
  debug: function(text) {
    xw.Log.append(text, "DEBUG");
  },
  info: function(text) {
    xw.Log.append(text, "INFO");
  },
  warn: function(text) {
    xw.Log.append(text, "WARN");
  },
  error: function(text) {
    xw.Log.append(text, "ERROR");
  },
  format: function(msg) {
    var hours = msg.timestamp.getHours().toString();
    var minutes = msg.timestamp.getMinutes().toString();
    var seconds = msg.timestamp.getSeconds().toString();
    if (hours.length < 2) {
      hours = "0" + hours;
    }
    if (minutes.length < 2) {
      minutes = "0" + minutes;
    }
    if (seconds.length < 2) {
      seconds = "0" + seconds;
    }
    var formattedTime = hours + ":" + minutes + ":" + seconds;
    var formattedMsg = formattedTime + " [" + msg.logLevel + "] " + msg.text;
    return formattedMsg;
  }
};

// 
// Local Storage
//
xw.LocalStorage = {
  isSupported: function() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  },
  getItem: function(key) {
    return xw.LocalStorage.isSupported() ? localStorage.getItem(key) : undefined;
  },
  setItem: function(key, value) {
    if (xw.LocalStorage.isSupported()) {
      localStorage[key] = value;
    }
  },
  remove: function(key) {
    if (xw.LocalStorage.isSupported()) {
      localStorage.removeItem(key);
    }
  },
  clear: function() {
    if (xw.LocalStorage.isSupported()) {
      localStorage.clear();
    }
  },
  length: function() {
    if (xw.LocalStorage.isSupported()) {
      return localStorage.length;
    }
  },
  getKey: function(idx) {
    if (xw.LocalStorage.isSupported()) {
      return localStorage.key(idx);
    }
  }
};

// 
// Expression language
//

xw.EL = {
  // Array of EL resolvers.  Each one defines a canResolve() and resolve() method
  resolvers: [],
  // Array of {widget: widget, propertyName: propertyName (or callback), expression: expr};
  bindings: [],
  // This is a function because some versions of some browsers cache the regex object,
  // so we need to create a new instance each time for cross-browser compatibility
  regex: function(expr) {
    return (typeof expr == "string") ? /#{(!?)([A-Za-z0-9]+(\.[A-Za-z0-9]+)*)}/g.exec(expr) :
      /#{(!?)([A-Za-z0-9]+(\.[A-Za-z0-9]+)*)}/g;
  },
  isExpression: function(expr) {
    return (typeof expr == "string") && xw.EL.regex().test(expr);
  },
  isValueExpression: function(expr) {
    if (xw.EL.isExpression(expr)) {
      var m = expr.match(xw.EL.regex());
      return m.length == 1 && m[0] == expr;
    }
    return false;
  },
  isInterpolatedExpression: function(expr) { 
    if (xw.EL.isExpression(expr)) {
      var m = expr.match(xw.EL.regex());
      return m.length >= 1 && m[0] != expr;
    }
    return false;
  },
  registerResolver: function(resolver) {
    xw.EL.resolvers.push(resolver);
  },
  // A helper method that creates a single-value resolver
  setValue: function(expr, value) {
    xw.EL.registerResolver({
      canResolve: function(p1) {
        return expr == p1;
      },
      resolve: function(p1) {
        return expr == p1 ? value : undefined;
      }
    });
  },
  unregisterResolver: function(resolver) {
    for (var i = xw.EL.resolvers.length - 1; i >= 0; i--) {
      if (xw.EL.resolvers[i] == resolver) {
        xw.EL.resolvers.splice(i, 1);
        break;
      }
    }
  },
  destroyViewBindings: function(view) {
    for (var i = xw.EL.bindings.length - 1; i >= 0; i--) {
      if (xw.EL.bindings[i].widget.owner == view) {
        xw.EL.bindings.splice(i, 1);
      }
    }
  },
  destroyViewResolvers: function(view) {
    for (var i = xw.EL.resolvers.length - 1; i >= 0; i--) {
      if (xw.EL.resolvers[i].owner == view) {
        xw.EL.resolvers.splice(i, 1);
      }
    }  
  },
  //
  // Invoked by an EL resolver when its value changes.  The resolver will invoke this
  // method with the rootName parameter containing the name of the root of the EL expression.
  // Any bindings that have the same root name will be evaluated.
  //
  notify: function(rootName) {
    for (var i = 0; i < xw.EL.bindings.length; i++) { 
      var binding = xw.EL.bindings[i];
      var match = false;
      
      if (binding.interpolated) {
        for (var j = 0; j < binding.expressions.length; j++) {
          if (xw.EL.rootName(binding.expressions[j]) == rootName) {
            binding.value = xw.EL.interpolate(binding.widget, binding.expression);
            match = true;
            break;
          }
        }
      } else if (xw.EL.rootName(binding.expression) == rootName) {    
        binding.value = xw.EL.eval(binding.widget, binding.expression);
        match = true;
      }
      
      if (match) {
        if (binding.propertyName) {
          // If the binding is for a widget property, "touch" the property so that it refreshes
          binding.widget._registeredProperties[binding.propertyName].touch();
//          xw.Sys.setObjectProperty(binding.widget, binding.propertyName, binding.value);    
        } else if (binding.callback) {
          binding.callback.apply(binding.widget, [binding.value]);
        }
      }
    }
  },  
  // Creates a new EL binding for a widget, to notify that widget when the EL value changes
  // Params:
  //   widget - the widget to bind to (must not be null)
  //   receiver - either a property name of the widget, or a callback function
  //   expr - the EL expression, either a single value binding expression (e.g. "#{foo}")
  //          or an interpolated expression (e.g. "#{foo}/#{bar}")
  createBinding: function(widget, receiver, expr) {
    var binding = {widget: widget,expression: expr};
    binding.interpolated = xw.EL.isInterpolatedExpression(expr);
   
    if (typeof receiver == "string") {
      binding.propertyName = receiver;
    } else {
      binding.callback = receiver;
    }
    
    if (binding.interpolated) {
      binding.expressions = expr.match(xw.EL.regex());  
    }
    
    xw.EL.bindings.push(binding);
    
    if (binding.interpolated) {
      return xw.EL.interpolate(widget, expr);
    } else {
      return xw.EL.eval(widget, expr);
    }
  },
  clearWidgetBinding: function(widget, property) {
    for (var i = xw.EL.bindings.length - 1; i >= 0; i--) {
      if (xw.EL.bindings[i].widget == widget &&
          xw.EL.bindings[i].propertyName == property) {
        xw.EL.bindings.splice(i, 1);
      }
    }  
  },
  clearWidgetBindings: function(widget) {
    for (var i = xw.EL.bindings.length - 1; i >= 0; i--) {
      if (xw.EL.bindings[i].widget == widget) {
        xw.EL.bindings.splice(i, 1);
      }
    }
  },
  lookupResolver: function(rootExpr) {
    for (var i = 0; i < xw.EL.resolvers.length; i++) {    
      if (xw.EL.resolvers[i].canResolve(rootExpr)) {
        return xw.EL.resolvers[i];
      }
    }
    return null;
  },
  eval: function(widget, expr) {
    var e = xw.EL.regex(expr);
    if (e === null) {
      throw "Error evaluating EL - [" + expr + "] is an invalid expression.";
    }

    var invert = e[1] === "!";
    var parts = e[2].split(".");
    var root = null;
          
    // First we walk up the component tree to see if the variable can be resolved within the widget's hierarchy
    var w = widget;
    while (w != null && !(w instanceof xw.View)) {
      if (xw.Sys.isDefined(w.resolve) && (typeof w.resolve == "function")) {
        var v = w.resolve(parts[0]);
        if (v != undefined) {
          root = v;
          break;
        }
      }
      if (w.parent == w) {
        break; // protection from infinite loops
      }
      w = w.parent;
    } 
    
    if (root === null && widget != null) {
      var w = widget.owner.getWidgetById(parts[0]);

      // Next we check if there are any named widgets within the same view that match        
      if (xw.Sys.isDefined(w)) {  
        root = w;
      // Last, we check all of the registered EL resolvers
      } else {
        var r = xw.EL.lookupResolver(parts[0]);
        if (r != null) {
          root = r.resolve(parts[0]);
        }
      }
    }
    
    // Lastly we check any data modules
    if (root === null) {
      for (var i = 0; i < xw.Controller.activeDataModules.length; i++) {
        var dm = xw.Controller.activeDataModules[i];
        var w = dm.getWidgetById(parts[0]);
        if (xw.Sys.isDefined(w)) {
          root = w;
          break;
        }
      }
    }
    
    if (root === null) {
      return undefined;
    }
    
    var value = root;
    for (var i = 1; i < parts.length; i++) {
      if (xw.Sys.isUndefined(value) || value == null) {
        break;
      } else {
        // Check if there is a getter method for the current part and invoke it if there is
        var isGetter = "is" + parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
        var getGetter = "get" + parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
        if (typeof value[isGetter] == "function") {
          value = value[isGetter].apply(value);
        } else if (typeof value[getGetter] == "function") {
          value = value[getGetter].apply(value);
        } else {
          value = value[parts[i]];
        }
      }
    }
    return xw.Sys.isUndefined(value) ? undefined : (invert ? !value : value);
  },
  rootName: function(expr) {
    return xw.EL.regex(expr)[2].split(".")[0];
  },
  interpolate: function(widget, text) {
    var replaced = text;
    
    if (xw.Sys.isDefined(replaced) && replaced !== null) {
      var expressions = text.match(xw.EL.regex());
      if (expressions != null) {
        for (var i = 0; i < expressions.length; i++) {
          var val = xw.EL.eval(widget, expressions[i]);
          if (xw.Sys.isUndefined(val)) {
            val = "undefined"; 
          } else if (val === null) {
            val = "null";
          }
          replaced = replaced.replace(expressions[i], val);
        }
      }
    }
    return replaced;
  }
};

//
// Transition effects
//
xw.FX = {
  

};

//
// Event bus
//
xw.Event = {
  observers: {},
  registerObserver: function(event, observer) {  
    if (xw.Sys.isUndefined(observer.fire) || (typeof observer.fire !== "function")) {
      alert("Error - could not register event observer [" + observer + "] for event [" + event + "] - " +
        "observer does not define a fire() method");
    }

    if (xw.Sys.isUndefined(xw.Event.observers[event])) {
      xw.Event.observers[event] = [];
    }
    xw.Event.observers[event].push(observer);
  },
  unregisterObserver: function(observer) {
    var check = function(val) { return val == observer; };
    for (var event in xw.Event.observers) {
      xw.Sys.deleteArrayElements(xw.Event.observers[event], check);
    }
  },
  fire: function(event, params) {
    if (xw.Sys.isDefined(xw.Event.observers[event])) {
      for (var i = 0; i < xw.Event.observers[event].length; i++) {
        xw.Event.observers[event][i].fire(params);
      }
    }
  }
};

//
// Ajax support
//

xw.Ajax = {
  loadingCallback: undefined,
  activeRequests: 0,
  setLoading: function(delta) {
    xw.Ajax.activeRequests += delta;
    if (xw.Sys.isDefined(xw.Ajax.loadingCallback) && typeof xw.Ajax.loadingCallback == "function") {
      xw.Ajax.loadingCallback(xw.Ajax.activeRequests);
    }
  },
  createRequestObject: function(callback, xml) {
    var r;
    if (window.XMLHttpRequest) {
      r = new XMLHttpRequest();
    } else {
      r = new ActiveXObject("Microsoft.XMLHTTP");
    }
    r.onreadystatechange = function() {
      if (r.readyState == 4) {
        try {
//          if (r.status >= 200 && r.status <= 299) {
            // Done to avoid a memory leak
            window.setTimeout(function() {
              r.onreadystatechange = function() {};
            }, 0);
            if (callback) {
              if (xml === true) {
                try {
                  r.responseXML.documentElement;
                  callback(r.responseXML, r);
                } catch (ex) {
                  try {
                    var doc = new ActiveXObject("Microsoft.XMLDOM");
                    doc.async = "false";
                    doc.loadXML(r.responseText);
                    callback(doc, r);
                  } catch (e) {
                    var p = new DOMParser();
                    callback(parser.parseFromString(r.responseText, "text/xml"), r);
                  }
                }
              } else {
                callback(r.responseText, r);
              }
            }
//          }
        } finally {
          xw.Ajax.setLoading(-1);
        }
      }
    }
    return r;
  },
  get: function(path, callback, xml) {
    xw.Ajax.setLoading(1);
    try {
      var r = xw.Ajax.createRequestObject(callback, xml);
      r.open("GET", path, true);
      r.send();
    } catch (e) {
      xw.Ajax.setLoading(-1);
    }
  },
  post: function(path, content, callback, xml) {
    xw.Ajax.setLoading(1);
    try {
      var r = xw.Ajax.createRequestObject(callback, xml);
      r.open("POST", path, true);
      r.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      r.send(content);
    } catch (e) {
      xw.Ajax.setLoading(-1);    
    }
  },
  invoke: function(options) {
    xw.Ajax.setLoading(1);
    try {      
      var r = xw.Ajax.createRequestObject(options.callback, options.xml);
      var method = xw.Sys.isDefined(options.method) ? options.method : "GET";
      r.open(method, options.path, true);
      if (xw.Sys.isDefined(options.headers)) {
        for (hdr in options.headers) {
          r.setRequestHeader(hdr, options.headers[hdr]);
        }
      }
      if (xw.Sys.isDefined(options.decorator)) {
        options.decorator.decorate.call(options.decorator, r);
      }      
      if (xw.Sys.isDefined(options.content)) {
        r.send(options.content);
      } else {
        r.send();
      }
    } catch (e) {
      xw.Log.error("Error invoking AJAX request: " + e);
      xw.Ajax.setLoading(-1);
    }
  }
};

xw.ViewNode = function(children) {
  this.children = children;
};

xw.DataModuleNode = function(children) {
  this.children = children;
};

xw.StyleElementNode = function(name, value) {
  this.name = name;
  this.value = value;
};

//
// Contains metadata about a view node that represents an event
//
xw.EventNode = function(type, script, vars) {
  this.type = type;
  this.script = script;
  this.vars = vars;
};

//
// Contains metadata about a view node that represents a widget
//
xw.WidgetNode = function(fqwn, attributes, children) {
  this.fqwn = fqwn;
  this.attributes = attributes;
  this.children = children;
};

//
// Contains metadata about a view node that represents a native html control
//
xw.XHtmlNode = function(tagName, attributes, children) {
  this.tagName = tagName;
  this.attributes = attributes;
  this.children = children;
};

xw.TextNode = function(attributes) {
  this.attributes = attributes;
  this.escape = true;
}

//
// Parses an XML-based definition and returns the root node
//
xw.DefinitionParser = function() {};

xw.DefinitionParser.prototype.parse = function(rootNode) {
  if (rootNode.namespaceURI === xw.CORE_NAMESPACE && rootNode.localName === "view") {
    return new xw.ViewNode(this.parseChildNodes(rootNode.childNodes));
  } else if (rootNode.namespaceURI === xw.CORE_NAMESPACE && rootNode.localName === "dataModule") {
    return new xw.DataModuleNode(this.parseChildNodes(rootNode.childNodes));
  } else {
    alert("Invalid resource definition - document root '" + rootNode.tagName +
      "' must be a 'view' or 'dataModule' element in namespace " + xw.CORE_NAMESPACE);  
  }
};

xw.DefinitionParser.prototype.parseUri = function(uri) {
  var i;
  var partNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"];
  var parts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(uri);
  var result = {};

  for (i = 0; i < 10; i++) {
    result[partNames[i]] = (parts[i] ? parts[i] : "");
  }

  if (result.directoryPath.length > 0) {
    result.directoryPath = result.directoryPath.replace(/\/?$/, "/");
  }

  return result;
};

xw.DefinitionParser.prototype.getFQCN = function(e) {
  var uri = this.parseUri(e.namespaceURI);
  var i;
  var fp = "";
  var parts = uri.domain.split(".");
  for (i = parts.length - 1; i >=0; i--) {
    fp += parts[i];
    if (i > 0) {
      fp += "/";
    }
  }
  if (typeof uri.directoryPath == "string" && uri.directoryPath.length > 0) {
    fp += uri.directoryPath + xw.Sys.capitalize(e.localName);
  } else {
    fp += "/" + xw.Sys.capitalize(e.localName);
  }
  return fp.replace(/\//g, ".");
};

//
// Convenience method, parses the attributes of an XML element
// and returns their values in an associative array
//
xw.DefinitionParser.prototype.getElementAttributes = function(e) {
  var attribs = {};
  var i, n;    
  for (i = 0; i < e.attributes.length; i++) {
     n = e.attributes[i].name;
     attribs[n] = e.getAttribute(n);
  }     
  return attribs;
}

//
// Converts XML into a definition
//  
xw.DefinitionParser.prototype.parseChildNodes = function(children) {
  var nodes = [];
  var i, j;

  for (i = 0; i < children.length; i++) {
    var e = children.item(i);

    if (e.namespaceURI === xw.XHTML_NAMESPACE) {
      nodes.push(new xw.XHtmlNode(e.localName, this.getElementAttributes(e), this.parseChildNodes(e.childNodes)));
    }
    else {
      // Process elements here
      if (e.nodeType === 1) {  
        if (e.namespaceURI === xw.CORE_NAMESPACE && e.localName === "event") {
          var event = this.parseEvent(e);
          if (event) {              
            nodes.push(event);
          }
        } else if (e.namespaceURI === xw.CORE_NAMESPACE && e.localName === "styleElement") {
          var styleElement = this.parseStyleElement(e);
          if (styleElement) {
            nodes.push(styleElement);
          }
        } else if (e.namespaceURI === xw.CORE_NAMESPACE && e.localName === "text") {
          var tn = new xw.TextNode(this.getElementAttributes(e));
          tn.escape = (e.getAttribute("escape") !== "false");
          nodes.push(tn);
        } else {
          nodes.push(new xw.WidgetNode(this.getFQCN(e), this.getElementAttributes(e), this.parseChildNodes(e.childNodes)));
        }          
      // Process text nodes here
      } else if (e.nodeType === 3) {
        var value = xw.Sys.trim(e.nodeValue);
        if (value.length > 0) {
          // We don't want to trim the actual value, as it may contain important space
          nodes.push(new xw.TextNode({value:e.nodeValue}));
        }
      }
    }
  }
  return nodes;
};

//
// Parses an XML element that contains an event definition and extracts the event type and script
// which are then returned as an EventNode instance.
xw.DefinitionParser.prototype.parseEvent = function(e) {
  var i, j, script;
  var eventType = e.getAttribute("type");
  for (i = 0; i < e.childNodes.length; i++) {
    var child = e.childNodes.item(i);

    if (child.nodeType === 1 && 
        child.namespaceURI === xw.CORE_NAMESPACE &&
        child.localName === "action" && 
        child.getAttribute("type") === "script") {
      // get all the text content of the action node, textContent would be easier but IE doesn't support that
      script = "";
      for (j = 0; j < child.childNodes.length; j++) {
        var grandChild = child.childNodes[j];
        var nodeType = grandChild.nodeType;

        // not TEXT or CDATA
        if (nodeType === 3 || nodeType === 4) {
          script += grandChild.nodeValue;
        }
      }
      return new xw.EventNode(eventType, script);
    // Otherwise if the child is a CDATA section assume it's a script
    } else if (child.nodeType === 4) {
      return new xw.EventNode(eventType, child.nodeValue);
    }
  }
};

xw.DefinitionParser.prototype.parseStyleElement = function(e) {
  var name = e.getAttribute("name");
  var value = e.getAttribute("value");
  return new xw.StyleElementNode(name, value);
};

xw.Controller = {
  //
  // A cache of resource name:root definition node values
  //
  resourceDefs: {},
  activeViews: [],
  activeDataModules: [],
  // A queue of resources to be opened
  queue: [],
  // Queued item states
  QUEUE_STATUS_UNPROCESSED: 1,
  QUEUE_STATUS_DEFINITION_LOADING: 2,
  QUEUE_STATUS_DEFINITION_LOADED: 3,
  QUEUE_STATUS_WIDGETS_LOADING: 4,
  QUEUE_STATUS_WIDGETS_LOADED: 5,
  QUEUE_STATUS_PROCESSED: 6,
  // 
  // Opens a resource, such as a view or data module
  //
  open: function(resource, params, container, callback) {
    xw.Log.debug("xw.Controller: Opening resource [" + resource + "]");
    xw.Controller.queue.push({
      resource: resource, 
      params: params, 
      container: container, 
      status: xw.Controller.QUEUE_STATUS_UNPROCESSED,
      callback: callback
    });
    xw.Controller.processQueue();
  },
  processQueue: function() {
    for (var i = 0; i < xw.Controller.queue.length; i++) {
      var item = xw.Controller.queue[i];
      
      if (item.status === xw.Controller.QUEUE_STATUS_UNPROCESSED ||
          item.status === xw.Controller.QUEUE_STATUS_DEFINITION_LOADING) {
        // If the resource is known, update its status
        if (xw.Sys.isDefined(xw.Controller.resourceDefs[item.resource])) {
          item.status = xw.Controller.QUEUE_STATUS_DEFINITION_LOADED;    
        } else if (item.status === xw.Controller.QUEUE_STATUS_UNPROCESSED) {
          // Otherwise load the resource
          item.status = xw.Controller.QUEUE_STATUS_DEFINITION_LOADING;
          xw.Controller.loadResource(item.resource);
        }    
      }
      
      if (item.status === xw.Controller.QUEUE_STATUS_DEFINITION_LOADED) {
      
        // Validate all of the widgets used by the resource    
        var invalid = xw.Controller.validateWidgets(null, xw.Controller.resourceDefs[item.resource].children, {});
        if (xw.Sys.objectSize(invalid) > 0) {
          // If there are invalid widgets, load them
          item.status = xw.Controller.QUEUE_STATUS_WIDGETS_LOADING;
          item.invalid = invalid;
          
          for (var fqwn in invalid) {
            if (xw.WidgetManager.getWidgetState(fqwn) === xw.WidgetManager.WS_FAILED) {
              item.status = xw.Controller.QUEUE_STATUS_PROCESSED;
              throw "Could not open resource [" + item.resource + "], widget [" + invalid[j] + "] failed to load.";
            }        
          }      
          
          xw.WidgetManager.loadWidgets(invalid);
        } else {
          item.status = xw.Controller.QUEUE_STATUS_WIDGETS_LOADED;
        }
      }
      
      if (item.status === xw.Controller.QUEUE_STATUS_WIDGETS_LOADING) {
        // Check if the widgets are loaded
        var loaded = true;
        
        for (var fqwn in item.invalid) {
          var state = xw.WidgetManager.getWidgetState(fqwn);
          if (state === xw.WidgetManager.WS_FAILED) {
            item.status = xw.Controller.QUEUE_STATUS_PROCESSED;
            throw "Could not open resource [" + item.resource + "], widget [" + fqwn + "] failed to load.";
          } else if (state !== xw.WidgetManager.WS_LOADED) {
            loaded = false;
            break;
          }
        }    
        
        if (loaded) {
          item.status = xw.Controller.QUEUE_STATUS_WIDGETS_LOADED;
        }
      }
      
      if (item.status === xw.Controller.QUEUE_STATUS_WIDGETS_LOADED) {
        var def = xw.Controller.resourceDefs[item.resource];
      
        // If there are still unloaded resources in the queue then wait until they're fully loaded
        var proceed = true;
        
        if (def instanceof xw.ViewNode) {
          for (var j = 0; j < xw.Controller.queue.length; j++) {
            var other = xw.Controller.queue[j];
            if (xw.Controller.resourceDefs[other.resource] instanceof xw.DataModuleNode &&
                       other.status < xw.Controller.QUEUE_STATUS_PROCESSED) {
              proceed = false;
              break;
            }
          }
        }
             
        if (proceed) {
          item.status = xw.Controller.QUEUE_STATUS_PROCESSED;          
          var params = (xw.Sys.isDefined(item.params) && item.params !== null) ? item.params : {};
          
          if (def instanceof xw.ViewNode) {
            xw.Controller.openView(item.resource, def, params, item.container, item.callback);
          } else if (def instanceof xw.DataModuleNode) {
            xw.Controller.openDataModule(item.resource, def, params, item.callback);
          }
        }
      }
    }  

    // Remove processed items from the queue  
    for (var i = xw.Controller.queue.length - 1; i >= 0; i--) {
      var item = xw.Controller.queue[i];
      if (item.status === xw.Controller.QUEUE_STATUS_PROCESSED) {
        xw.Controller.queue.splice(i,1);
      }
    }
  },
  //
  // Validate that the widgets used in the specified view are all loaded
  //
  validateWidgets: function(parent, children, invalid) {
    var i, fqwn;  
    for (i = 0; i < children.length; i++) {
       if (children[i] instanceof xw.WidgetNode) {
         fqwn = children[i].fqwn;         
         if (!xw.Sys.classExists(fqwn)) {
           if (xw.Sys.isUndefined(invalid[fqwn])) {
             invalid[fqwn] = {parents:[]};
           }
         
           // Populate this so that we can always load the parent widgets
           // first - (don't add if the widget is its own parent!)
           if (parent != null && xw.Sys.isDefined(parent.fqwn) && 
               parent.fqwn != fqwn &&
               !xw.Array.contains(invalid[fqwn].parents, parent.fqwn)) {
             invalid[fqwn].parents.push(parent.fqwn);
           }
         }
       }
       if (xw.Sys.isDefined(children[i].children)) {
         xw.Controller.validateWidgets(children[i], children[i].children, invalid);
       }
    }
    return invalid;
  },
  //
  // Loads the view definition from the server
  //
  loadResource: function(resource) { 
    var path = xw.viewPath == null ? resource : (xw.viewPath + resource);

    // If there is a script for this view, load it first
    var script = path.replace(/\.[^/.]+$/, "") + ".js";    
    xw.Sys.loadSource(script);
    
    xw.Log.debug("xw.Controller: Loading resource [" + path + "]");
    var req = xw.Sys.createHttpRequest("text/xml");
    req.onreadystatechange = function() { xw.Controller.loadResourceCallback(req, resource) };
    req.open("GET", path, true);
    req.send(null);
    return req;
  },
  loadResourceCallback: function(req, resource) {
    if (req.readyState === 4) {
      if (req.status === 200 || req.status === 0) {
        var rootNode;
        if (req.responseXml) rootNode = req.responseXML.documentElement;
        else if (req.responseText && req.responseText.length > 0) {
          rootNode = xw.Sys.parseXml(req.responseText).documentElement;
        }

        if (rootNode) {         
          // Parse the XML resource definition and store it in the resource definition cache
          xw.Controller.resourceDefs[resource] = new xw.DefinitionParser().parse(rootNode);
          xw.Controller.processQueue();
        }
        else {
          throw "Resource [" + resource + "] could not be loaded..  If you are attempting to load " +
                "from the local file system, the security model of some browsers (such as Chrome) " +
                "might not support this.";
        }
      }
      else {
        throw "There was an error when trying to load resource [" + resource + "] - Error code: " + req.status;
      }
    };
  },
  openView: function(viewName, definition, params, c, callback) {
    xw.Log.debug("xw.Controller: Opening view [" + viewName + "]");
    // Determine the container control 
    var container = ("string" === (typeof c)) ? xw.Sys.getObject(c) : c;
    
    if (container == null) {
      throw "Error opening view - container [" + c + "] not found.";
      return;
    } 

    // If the container already contains a view, destroy it
    for (var i = 0; i < xw.Controller.activeViews.length; i++) {
      var entry = xw.Controller.activeViews[i];
      if (entry.container == container) {
        entry.view.destroy();
        xw.Controller.activeViews.splice(i, 1);
        break;
      }
    }
    
    // If anything else is remaining, clear it
    xw.Sys.clearChildren(container);
      
    var view = new xw.View();
    view.viewName = viewName;
    view.params = params;
    xw.Controller.parseChildren(view, definition.children, view);
    xw.Controller.activeViews.push({container: container, view: view});
    view.render(container);
    
    if (typeof callback == "function") {
      callback.call(view, view);
    }
  },
  openDataModule: function(dataModule, definition, params, callback) {
    xw.Log.debug("xw.Controller: Opening data module [" + dataModule + "]");
    var dm = new xw.DataModule();
    dm.dataModule = dataModule;
    dm.params = params;
    xw.Controller.parseChildren(dm, definition.children, dm);
    xw.Controller.activeDataModules.push(dm);
    if (typeof dm.open == "function") {
      dm.open();
    }
    if (typeof callback == "function") {
      callback.call(dm, dm);
    }
  },
  //
  // This recursive function does the work of converting the view definition into
  // actual widget instances
  //
  parseChildren: function(owner, childNodes, parentWidget) {
    var i, widget;
    var widgets = [];
    for (i = 0; i < childNodes.length; i++) {
      var c = childNodes[i];
      if (c instanceof xw.WidgetNode) {
        
        // Create an instance of the widget and set its parent and view
        widget = xw.Sys.newInstance(c.fqwn);
        widget.parent = parentWidget;
        widget.owner = owner;
        
        // Set the widget's attributes
        for (var p in c.attributes) {
        	if (xw.Array.contains(widget._registeredEvents, p)) {
		        var action = new xw.Action();
		        action.parent = widget;
		        action.script = c.attributes[p];
		        action.owner = owner;
		        widget[p] = action;
        	} else {
        	  widget[p] = c.attributes[p];
//            xw.Sys.setObjectProperty(widget, p, c.attributes[p]);
          }
        }
        
        widgets.push(widget);
        
        // If this node has children, parse them also
        if (xw.Sys.isDefined(c.children) && c.children.length > 0) {
          xw.Controller.parseChildren(owner, c.children, widget);
        }
      } else if (c instanceof xw.EventNode) {      
        var action = new xw.Action();
        action.parent = parentWidget;
        action.script = c.script;
        action.owner = owner; 
        parentWidget[c.type] = action;
      } else if (c instanceof xw.StyleElementNode) {
        if (xw.Sys.isUndefined(parentWidget.styles)) {
          parentWidget.styles = {};
        }
        parentWidget.styles[c.name] = c.value;
      } else if (c instanceof xw.XHtmlNode) {
        widget = new xw.XHtml();      
        widget.parent = parentWidget;
        widget.owner = owner;
        widget.tagName = c.tagName;
        widget.attributes = c.attributes;
        widgets.push(widget);
        if (xw.Sys.isDefined(c.children) && c.children.length > 0) {
          xw.Controller.parseChildren(owner, c.children, widget);
        }
      } else if (c instanceof xw.TextNode) {
        widget = new xw.Text();
        widget.parent = parentWidget;
        widget.owner = owner;
        widget.escape = c.escape;
        
        // Set the widget's attributes
        for (var p in c.attributes) { 
          widget[p] = c.attributes[p];
//          xw.Sys.setObjectProperty(widget, p, c.attributes[p]);
        }
              
        widgets.push(widget);
      }
    }
      
    if (widgets.length > 0) {
      parentWidget.children = widgets;    
    }
  }
};

//
// This class is responsible for loading the source code for widgets that have not been loaded already
//
xw.WidgetManager = {
  WS_QUEUED: "QUEUED",
  WS_LOADING: "LOADING",
  WS_LOADED: "LOADED",
  WS_FAILED: "FAILED",
  //
  // Tracks the state of the widgets being loaded
  //
  widgets: {},
  getWidgetState: function(fqwn) {
    return xw.Sys.isDefined(xw.WidgetManager.widgets[fqwn]) ?
      xw.WidgetManager.widgets[fqwn].state : undefined;
  },
  getWidgetParents: function(fqwn) {
    return xw.Sys.isDefined(xw.WidgetManager.widgets[fqwn]) ?
      xw.WidgetManager.widgets[fqwn].parents : undefined;  
  },
  initWidget: function(fqwn, parents, state) {
    xw.WidgetManager.widgets[fqwn] = {state: state, parents: parents};  
  },
  setWidgetState: function(fqwn, state) {
    xw.WidgetManager.widgets[fqwn].state = state;
  },
  //
  // Load the widgets specified in the widgets array parameter, then open the specified view in
  // the specified container 
  //
  loadWidgets: function(widgets) {
    var wl = "";
    for (var fqwn in widgets) {
      if (wl.length > 0) {
        wl += ", ";
      }
      wl += fqwn;
    }
    xw.Log.debug("xw.WidgetManager: Loading widgets [" + wl + "]");
    var i;
    var wm = xw.WidgetManager;
    
    var queued = false;
    
    for (var fqwn in widgets) {
      if (xw.Sys.isUndefined(wm.getWidgetState(fqwn))) {
        wm.initWidget(fqwn, widgets[fqwn].parents, wm.WS_QUEUED);
        queued = true;
      }     
    }
    
    // If there are any queued widgets that have not yet been loaded, load them
    // otherwise pass control back to the controller
    if (queued) {
      wm.loadQueuedWidgets();
    } else {
      xw.Controller.processQueue();
    }
  },
  loadQueuedWidgets: function() {
    var wm = xw.WidgetManager;
    outer:
    for (var fqwn in wm.widgets) {
      var state = wm.getWidgetState(fqwn);
      var parents = wm.getWidgetParents(fqwn);

      if (state === wm.WS_QUEUED) {
        // Last check to see if the class exists before we try loading it
        if (!xw.Sys.classExists(fqwn)) {        
          for (var i = 0; i < parents.length; i++) {
            if (!xw.Sys.classExists(parents[i])) {
              continue outer;
            }
          }
        
          // Set the widget state to LOADING
          wm.setWidgetState(fqwn, wm.WS_LOADING);
          
          // Define callback methods for success and failure
          var successCallback = function() {
            wm.setWidgetState(fqwn, wm.WS_LOADED);
            wm.loadQueuedWidgets();
          };
          
          var failureCallback = function() {
            wm.setWidgetState(fqwn, wm.WS_FAILED);
            wm.loadQueuedWidgets();
          };
          
          var url = xw.Sys.getBasePath() + fqwn.replace(/\./g, "/").toLowerCase() + ".js";    
          xw.Sys.loadSource(url, successCallback, failureCallback);
          return;      
        } else {
          wm.setWidgetState(fqwn, wm.WS_LOADED);
        }
      }  
    }
    xw.Controller.processQueue();
  }
};

//
// Defines a registered widget property
//
xw.Property = function(owner, name, options) {
  this.owner = owner;
  this.name = name;
  this.value = undefined;
  
  if (xw.Sys.isDefined(options)) {
    this.type = options.type;
    
    if (xw.Sys.isDefined(options.default)) {
      this.setValue(options.default);
    }
    
    if (xw.Sys.isDefined(options.onChange)) {
      this.onChange = options.onChange;
    }
  }
};

xw.Property.prototype.isSet = function() {
	return xw.Sys.isDefined(this.value);
};

xw.Property.prototype.getValue = function() {
  return this.value;
};

/*
 * Called when the bound EL expression evaluates to an updated value
 */
xw.Property.prototype.touch = function() {
  if (xw.Sys.isDefined(this.binding)) {
    this.value = xw.EL.eval(this.owner, this.binding);
    if (xw.Sys.isDefined(this.onChange)) {
      this.onChange.call(this.owner, this.value);
    }    
  }
};

xw.Property.prototype.setValue = function(val) {
  xw.EL.clearWidgetBinding(this.owner, this.name);
  if (xw.EL.isExpression(val)) {
    this.value = xw.EL.createBinding(this.owner, this.name, val);
    this.binding = val;
  } else {
    if ("true" == val) {
      this.value = true;
    } else if ("false" == val) {
      this.value = false;
    } else {
      this.value = val;
    }
    delete this["binding"];
  }
  if (xw.Sys.isDefined(this.onChange)) {
    this.onChange.call(this.owner, this.value);
  }
};

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 * - Adapted from http://ejohn.org/blog/simple-javascript-inheritance/
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  xw.Class = function(){}; 
  xw.Class.extend = function(prop) {
    var _super = this.prototype;
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    for (var name in prop) {
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);        
            this._super = tmp;           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    function Class() {
      if (!initializing && this._constructor)
        this._constructor.apply(this, arguments);
    }   
    Class.prototype = prototype;
    Class.prototype.constructor = Class;
    Class.extend = arguments.callee;  
    return Class;
  };
})();

//
// Base class for widgets
//
xw.Widget = xw.Class.extend({
  _constructor: function() {
    this.parent = null;
    this.owner = null;
    this.uid = xw.Sys.uid();
    this._registeredProperties = [];
    this._registeredEvents = [];
    this.children = [];
    this.registerProperty("id", {onChange: this.updateId});
  },
  updateId: function(id) {
    // register the id of this widget with the owning view.
    if (xw.Sys.isDefined(id)) {
      this.owner.registerWidget(this);
    } else {
      this.owner.unregisterWidget(this);
    }
  },
  registerProperty: function(name, options) {
    if (xw.Sys.isUndefined(name)) {
      throw "No name specified for registered property on object [" + this.toString() + "]";
    }
    this._registeredProperties[name] = new xw.Property(this, name, options);
    Object.defineProperty(this, name, {
      get: function() { return this._registeredProperties[name].getValue() },
      set: function(newValue) { 
        this._registeredProperties[name].setValue(newValue);
      },
      enumerable: true,
      configurable: true
    });
  },
  // Sets the property value of all child nodes of a specified type
  propagateChildProperty: function(cls, propName, val) {
    var f = function(p) {
      if (xw.Sys.isDefined(p.children)) {
        for (var i = 0; i < p.children.length; i++) {
          if (p.children[i] instanceof cls) {
            p.children[i][propName] = val;
//            xw.Sys.setObjectProperty(p.children[i], propName, val);
          }
          f(p.children[i]);
        }
      }
    }
    f(this);
  },
  findNearestAncestor: function(cls) {
    if (xw.Sys.isUndefined(cls)) {
      xw.Log.error("Illegal argument, cls is undefined");
    }
    var p = this.parent;
    while (xw.Sys.isDefined(p)) {
      if (p instanceof cls) {
        return p;
      }
      p = p.parent;
    }
  },
  addEvent: function(control, eventName, event) {     
    if (xw.Sys.isDefined(this["on" + eventName]) && xw.Sys.isDefined(event)) {        
      var sender = this;
      var action = function() {
        event.invoke(sender);
      };
      xw.Sys.chainEvent(control, eventName, action);
    }
  },
  registerEvent: function(eventName) {
    if (!xw.Array.contains(this._registeredEvents, eventName)) {
      this._registeredEvents.push(eventName);
    }
  },
  clearChildren: function() {
    if (xw.Sys.isDefined(this.children)) {
      for (var i = this.children.length - 1; i >= 0; i--) {
        this.children[i].destroy();
      }
    }  
  },
  destroy: function() {
    xw.EL.clearWidgetBindings(this);
    this.clearChildren();
  },
  // Makes a cloned copy of the widget.  Any properties that contain
  // references to other widgets will not be cloned, they will just be
  // updated with a reference to that widget
  clone: function(parent) {
    var o = Object.create(this);
    
    // Set the parent
    o.parent = xw.Sys.isUndefined(parent) ? this.parent : parent;    

    // Clone the registered properties only, plus any Actions
    for (var p in this) {
      if (this[p] instanceof xw.Property) {
      
        // TODO create a proper xw.Property.clone() method that does this
        var prop = this[p];
        o[p] = new xw.Property(o, prop.name);
        o[p].onChange = prop.onChange;
        o[p].type = prop.type;
        if (xw.EL.isExpression(this[p].binding)) {
          o[p].binding = this[p].binding;
        } else {
          if (this[p] instanceof xw.Widget) {
            o[p] = this[p];
          } else {
            o[p] = xw.Sys.cloneObject(this[p]);
          }
        }
      } else if (this[p] instanceof xw.Action) {
        o[p] = this[p].clone(o);       
      }
    }
    
    // Clone the children if there are any
    if (xw.Sys.isDefined(this.children)) {
      if (this.children.length > 0) {
        o.children = [];
      
        for (var i = 0; i < this.children.length; i++) {
          o.children.push(this.children[i].clone(o));
        }
      }
    }
    return o;
  },
  toString: function() {
    return "xw.Widget[" + this.id + "]";
  }
});

xw.Visual = xw.Widget.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("styles", {default:{}});
    this.registerEvent("afterRender");
  },
  renderChildren: function(container) {
    if (xw.Sys.isDefined(this.children)) {
      for (var i = 0; i < this.children.length; i++) {
        this.renderChild(this.children[i], container);
      }
    }
  },
  renderChild: function(child, container) {
    if (child instanceof xw.Visual) {  
      if (xw.Sys.isUndefined(child.render)) {
        throw "Error - widget [" + child + "] extending xw.Visual does not provide a render() method";
      } else {
        child.render.call(child, container);         
        if (xw.Sys.isDefined(child.afterRender)) {
          child.afterRender.invoke(child);
        }                    
      }
    } else if (child instanceof xw.NonVisual) {     
      if (typeof child.open == "function") {
        child.open();
      }
    } else {
      throw "Error - unrecognized widget type [" + child + "] encountered in view definition";
    }
  },
  registerStyles: function(values) {
    for (var n in values) {
      this.styles[n] = values[n];
    }
  },
  setStyleClass: function(control, styleName) {
    if (control != null && this.isStyleSet(styleName)) {
      control.className = this.getStyle(styleName);
    }
  },
  getStyle: function(name) {
    return this.isStyleSet(name) ? this.styles[name] : null;
  },
  isStyleSet: function(name) {
    return xw.Sys.isDefined(this.styles) && 
      xw.Sys.isDefined(this.styles) && 
      xw.Sys.isDefined(this.styles[name]);
  }
});

xw.NonVisual = xw.Widget.extend({
  _constructor: function() {
    this._super(false);
  },
  openChildren: function(container) {
    var i;
    for (i = 0; i < this.children.length; i++) {
      if (this.children[i] instanceof xw.Visual) {  
        throw "Error - widget extending xw.Visual may not be a child of a widget extending xw.NonVisual";
      } else if (this.children[i] instanceof xw.NonVisual) {   
        if (typeof this.children[i].open == "function") {   
          this.children[i].open();
        }
      } else {
        throw "Error - unrecognized widget type [" + this.children[i] + "] encountered in view definition";
      }
    }
  }
});

// Represents an XHTML element
xw.XHtml = xw.Visual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("tagName", {default: null});
    this.registerProperty("attributes", {default: null});
    this.control = null;  
  },
  render: function(container) {
    this.control = document.createElement(this.tagName);
    for (var a in this.attributes) {
      var val = this.attributes[a];
      if (xw.EL.isExpression(val)) {
        this.setAttribute(a, xw.EL.eval(this, val));
      } else {
        this.setAttribute(a, val);
      }
    }
    container.appendChild(this.control);
    this.renderChildren(this.control);
  },
  setAttribute: function(attribName, value) {
    if (attribName == "class") {
      this.control.className = value;
    } else if (attribName == "style") {
      this.control.style.cssText = value;
    // TODO standardize attribute replacement
    } else if (this.control.tagName == "label" && attribName == "for") {
      this.control.htmlFor = value;
    } else {
      this.control[attribName] = value;
    }
  },
  toString: function() {
    return "xw.XHtml[" + this.tagName + "]"; 
  }
});

// Represents plain ol' text
xw.Text = xw.Visual.extend({
  _constructor: function() {
    this._super(false);
    delete children;
    var that = this;
    this.registerProperty("value", {onChange: this.renderText});
    this.registerProperty("escape", {default: true});
    this.control = null;  
  },
  render: function(container) {
    this.control = document.createElement("span");
    container.appendChild(this.control);
    this.renderText();
  },
  renderText: function() {
    if (this.control !== null) {
      var text = (xw.Sys.isDefined(this.value) && this.value !== null) ?
         this.value : "";
      if (this.escape) {
        this.control.innerHTML = text;
      } else {
        if (!xw.Sys.isDefined(this.textNode)) {        
          this.textNode = document.createTextNode();
          this.control.appendChild(this.textNode);
        }
        this.textNode.nodeValue = text;
      }
    }
  },
  toString: function() {
    return "xw.Text[" + this.value + "]";
  }
});

xw.Action = xw.NonVisual.extend({ 
  _constructor: function() {
    this._super(false);
    this.script = null;
  },
  invoke: function(callee, args) {
    if (xw.Sys.isDefined(this.script)) {     
      // local variable, required to set up script variables     
      var __registered = {};
      
      // local variable, visible to our evaluated script -
      // makes the view or data module params available
      var params = this.owner.params;
      
      // register variables for all widgets within the same view/data module with an id
      xw.Array.iterate(this.owner._registeredWidgets, function(element) {
        __registered[element.id] = element;
      });

      // register variables for all widgets with an id from any data modules, if there
      // is no local overriding variable
      for (var i = 0; i < xw.Controller.activeDataModules.length; i++) {
        var dm = xw.Controller.activeDataModules[i];
        xw.Array.iterate(dm._registeredWidgets, function(element) {
          if (xw.Sys.isUndefined(__registered[element.id])) {
            __registered[element.id] = element;
          }       
        });
      }
      
      // The script must have access to named widgets (widgets with an id)
      // to do this, we inject some additional lines into the front of the 
      // script.
      var __script = "{";

      for (var id in __registered) {
        __script += "  var " + id + " = __registered[\"" + id + "\"];";
      }
             
      __script += this.script;
      __script += "}";
      
      var that = this;
      var ev = function(expr) {
        return xw.EL.eval(that, expr);
      };
      
      var argNames = ["__registered", "params", "_owner", "evaluate"];
      // The actual argument array which will be passed to the function call
      var a = [__registered, params, this.owner, ev];

      for (var arg in args) {
        argNames.push(arg);
        a.push(args[arg]);
      }
      
      return new Function(argNames, __script).apply(callee, a);
    }
  },
  toString: function() {
    return "xw.Action[]";
  }
});

xw.Container = xw.Visual.extend({
  _constructor: function() {
    this._super(false);
  }
});

//
// A single instance of a view
//
xw.View = xw.Container.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("viewName");
    this.registerProperty("params");
    this.registerEvent("afterRender");
    // The container control
    this.container = null;  
    this._registeredWidgets = [];  
    delete this.parent;    
  },
  //
  // Callback for window resize events
  //
  resize: function() {
    // bubble the resize event through the component tree
  },
  render: function(container) {
    this.container = container;

    // Set the window resize callback so that we can respond to resize events
    var target = this;
    var callback = function() { target.resize(); };
    xw.Sys.chainEvent(window, "resize", callback);
   
    this.renderChildren(this.container);
    
    if (xw.Sys.isDefined(this.afterRender)) {
      this.afterRender.invoke(this);
    }
  },
  appendChild: function(child) {
    this.container.appendChild(child);
  },
  // Registers a named (i.e. having an "id" property) widget
  registerWidget: function(widget) {
    this._registeredWidgets.push(widget);
  },
  unregisterWidget: function(widget) {
    xw.Array.remove(this._registeredWidgets, widget);
  },
  getWidgetById: function(id) {
    for (var i = 0; i < this._registeredWidgets.length; i++) {
      if (this._registeredWidgets[i].id == id) {
        return this._registeredWidgets[i];
      }
    }
  },
  destroy: function() {
    xw.EL.destroyViewBindings(this);
    xw.EL.destroyViewResolvers(this);

    if (this.container != null) {
      if (xw.Sys.isDefined(this.children)) {
        this.destroyChildren(this.children);
      }
    }
  },
  destroyChildren: function(children) {
    for (var i = 0; i < children.length; i++) {
      if (xw.Sys.isDefined(children[i].children) && children[i].children.length > 0) {
        this.destroyChildren(children[i].children);
      }
      children[i].destroy();
    };
  },
  toString: function() {
    return "xw.View [" + this.viewName + "]";
  }
});

xw.DataModule = xw.NonVisual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("moduleName");
    this.registerProperty("params");
    this.registerEvent("afterOpen");
    this._registeredWidgets = [];  
    delete this.parent;
  },
  open: function() {
    this.openChildren();    
    if (xw.Sys.isDefined(this.afterOpen)) {
      this.afterOpen.invoke(this);
    }
  },
  // Registers a named (i.e. having an "id" property) widget
  registerWidget: function(widget) {
    this._registeredWidgets.push(widget);
  },
  unregisterWidget: function(widget) {
    xw.Array.remove(this._registeredWidgets, widget);
  },
  getWidgetById: function(id) {
    for (var i = 0; i < this._registeredWidgets.length; i++) {
      if (this._registeredWidgets[i].id == id) {
        return this._registeredWidgets[i];
      }
    }
  },
  toString: function() {
    return "xw.DataModule [" + this.moduleName + "]";
  }
});

//
// GENERAL METHODS
//

//
// Utility class for creating a modal dialog window
// 
// Valid option properties:
//   params: Params to pass to the view to open
//   title: The title of the popup window
//   width: The fixed width of the popup window
//   height: The fixed height of the popup window
//   callback: The callback function to invoke after the view is opened
//
xw.Popup = {
  windowClass: "xwPopupWindow",
  contentClass: "xwPopupContent",
  titleClass: "xwPopupTitle",
  closeButtonClass: "xwPopupCloseButton",
  backgroundClass: "xwPopupBackground",
  activeView: undefined,
  open: function(viewName, options) {
    var title = "";
    var params, width, height, callback;

    if (xw.Sys.isDefined(options)) {
      if (options.title) {
        title = options.title;
      }
      if (options.params) {
        params = options.params;
      }
      
      if (options.width) {
        width = options.width;
      }
      
      if (options.height) {
        height = options.height;
      }
      
      if (options.callback) {
        callback = options.callback;
      }
    }
  
    var bg = document.createElement("div");
    bg.style.zIndex = "101";
    bg.style.backgroundColor = "#000000";
    if (xw.Popup.backgroundClass !== null) {
      bg.className = xw.Popup.backgroundClass;
    } 
    
    // Set transparency
    bg.style.filter = "alpha(opacity=25);"  
    bg.style.MozOpacity = ".25";
    bg.style.opacity = ".25";  
    bg.style.position = "fixed";
    bg.style.top = "0px";
    bg.style.left = "0px";
    bg.style.right = "0px";
    bg.style.bottom = "0px";
    
    xw.Popup.background = bg;

    var outer = document.createElement("div");
    outer.style.position = "absolute";
    outer.style.zIndex = 123;
    outer.style.width = xw.Sys.isDefined(width) ? (width + "px") : "400px"; // default width of 400px
    outer.style.height = xw.Sys.isDefined(height) ? (height + "px") : "400px"; // default height of 400px
    outer.style.left = "0px";
    outer.style.right = "0px";
    outer.style.top = "0px";  
    outer.style.bottom = "0px";
    outer.style.overflow = "hidden";
    outer.style.marginLeft = "auto";
    outer.style.marginRight = "auto";
    outer.style.marginTop = "auto";
    outer.style.marginBottom = "auto";
    outer.style.paddingLeft = "18px";
    outer.style.paddingRight = "30px";
    outer.style.paddingTop = "18px";
    outer.style.paddingBottom = "30px"; 
    xw.Popup.outer = outer;
    
    var inner = document.createElement("div");
    inner.style.position = "relative";
    inner.style.backgroundColor = "#ffffff";  
    inner.style.width = "100%";
    inner.style.height = "100%"; 
    inner.style.boxShadow = "4px 4px 10px 2px #999";
    inner.style.MozBoxShadow = "4px 4px 10px 2px #999";
    inner.style.WebkitBoxShadow = "4px 4px 10px 2px #999";
    inner.style.zIndex = 130; 
    
    if (xw.Popup.windowClass !== null) {
      inner.className = xw.Popup.windowClass;
    }  
    
    outer.appendChild(inner);
    
    var closebtn = document.createElement("div");
    closebtn.className = xw.Popup.closeButtonClass;
    closebtn.onclick = xw.Popup.close;
    closebtn.style.zIndex = 150;
    inner.appendChild(closebtn);  
      
    var titleDiv = document.createElement("div");
    titleDiv.appendChild(document.createTextNode(title));
    titleDiv.className = xw.Popup.titleClass;
    inner.appendChild(titleDiv);
    
    var contentDiv = document.createElement("div");
    contentDiv.style.overflowX = "auto";
    contentDiv.style.overflowY = "auto";
    
    if (xw.Popup.contentClass !== null) {
      contentDiv.className = xw.Popup.contentClass;
    }
    
    inner.appendChild(contentDiv);
    
    var cb = function(view) {
      xw.Popup.activeView = view;
      if (callback && typeof callback == "function") {
        callback.call(view, view);
      }
    }
    xw.open(viewName, params, contentDiv, cb);

    document.body.appendChild(bg);
    document.body.appendChild(outer);
  },
  close: function() {
    if (xw.Popup.outer != null) {
      document.body.removeChild(xw.Popup.outer);
      xw.Popup.outer = null;
    }
    if (xw.Popup.background != null) {
      document.body.removeChild(xw.Popup.background);
      xw.Popup.background = null;
    }
    if (xw.Sys.isDefined(xw.Popup.activeView)) {
      xw.Popup.activeView.destroy();
      xw.Popup.activeView = undefined;
    }
  }
};

//
// Opens a resource (e.g. a view or data module) - this call is asynchronous
//
xw.open = function(viewName, params, container, callback) {
  xw.Controller.open(viewName, params, container, callback);
};

xw.ready = {
  registered: [],
  register: function(f) {
    xw.ready.registered.push(f);
  },
  invoke: function() {
    document.removeEventListener("DOMContentLoaded", xw.ready.invoke, false);
    window.removeEventListener("load", xw.ready.invoke, false);
    xw.ready.scanDocument();
    for (var i = 0; i < xw.ready.registered.length; i++) {
      xw.ready.registered[i].call();
    }
  },
  // Walks through the DOM and scans for any view or datamodule nodes that should be opened
  scanDocument: function() {
    var xwNodes = [];

    var scanDOM = function(node) {
      if (node && (node.nodeName.toUpperCase() == "XW:VIEW" ||
          node.nodeName.toUpperCase() == "XW:DATAMODULE")) {
        xwNodes.push(node);   
      }
    
      node = node.firstChild;
      
      while (node) {
        scanDOM(node);
        node = node.nextSibling;
      }  
    };
    
    scanDOM(document.body);
    
    for (var i = 0; i < xwNodes.length; i++) {
      // TODO implement params support
      xw.Controller.open(xwNodes[i].attributes.getNamedItem("name").value, null, xwNodes[i].parentNode);
    }
  }  
};

new function() {
  document.addEventListener("DOMContentLoaded", xw.ready.invoke, false);
  window.addEventListener("load", xw.ready.invoke, false);
}();
