package("org.xwidgets.core");

org.xwidgets.core.WebSocket = xw.NonVisual.extend({
  _constructor: function() {
    this._super(false);
    this.registerProperty("hostname", {default: "localhost"});
    this.registerProperty("port");
    this.registerProperty("path");
    this.registerProperty("url");
    this.registerProperty("autoConnect", {default: false});
    this.registerEvent("oncreate");
    this.registerEvent("onopen");
    this.registerEvent("onmessage");
    this.registerEvent("onerror");
    
    this.queue = [];
    this.websocket = null;
  },
  open: function() {
    if (this.autoConnect.value === true) {
      this.connect();
    }
    
    var that = this;
    if (xw.Sys.isDefined(this.oncreate)) {
      that.oncreate.invoke(that);
    }
  },
  connect: function() {
    var uri = "ws://" + this.hostname.value + ":" + this.port.value + this.path.value;
    this.websocket = new WebSocket(xw.Sys.isDefined(this.url.value) ? this.url.value : uri);
    var that = this;
    var onOpen = function(evt) {
      if (xw.Sys.isDefined(that.onopen)) {
        that.onopen.invoke(that, {event: evt});
      }    
      // Send any queued messages
      for (var i = 0; i < that.queue.length; i++) {
        that.websocket.send(that.queue[i]);
      }
      that.queue = [];
    };
    this.websocket.onopen = onOpen;
    var onMessage = function(evt) {
      if (xw.Sys.isDefined(that.onmessage)) {
        that.onmessage.invoke(that, {event: evt});
      }
    };
    this.websocket.onmessage = onMessage;
    var onError = function(evt) {
      if (xw.Sys.isDefined(that.onerror)) {
        that.onerror.invoke(that, {event: evt});
      }
    };
    this.websocket.onerror = onError;
  },
  send: function(message) {
    if (this.isConnected()) {
      this.websocket.send(message);    
    } else if (this.websocket != null && this.websocket.readyState == 0) {
      // The websocket is still connecting...queue the message
      this.queue.push(message);
    } else {
      xw.Log.error("Cannot send message, please connect first");    
    }
  },
  isConnected: function() {
    return this.websocket != null && this.websocket.readyState == 1;
  },
  toString: function() {
    return "org.xwidgets.core.WebSocket[" + this.url.value + "]";
  }
});

//# sourceURL=org/xwidgets/core/websocket.js
