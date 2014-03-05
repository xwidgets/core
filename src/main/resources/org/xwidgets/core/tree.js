package("org.xwidgets.core");

org.xwidgets.core.TreeNode = function(value, leaf, userObject) {
  this.value = value;
  this.leaf = leaf ? leaf : false;
  this.userObject = userObject ? userObject : null;
  this.children = new Array();
  this.parent = null;
  this.expanded = false;
  this.model = null;
  
  var p = org.xwidgets.core.TreeNode.prototype;

  p.getUserObject = function() {
    return this.userObject;
  }

  p.setUserObject = function(obj) {
    this.userObject = obj;
  }

  p.setModel = function(model) {
    this.model = model;
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].setModel(model);
    }
  }

  p.add = function(node) {
    node.parent = this;
    this.children.push(node);
    node.setModel(this.model);
  }

  p.children = function() {
    return this.children;
  }

  p.getChildAt = function(index) {
    return this.children[index];
  }

  p.getChildCount = function() {
    return this.children.length;
  }

  p.getIndex = function(node) {
    for (var i = 0; i < this.children.length; i++) {
      if (this.children[i] == node)
        return i;
    }
    return -1;
  }

  p.getParent = function() {
    return this.parent;
  }

  p.isLeaf = function() {
    return this.leaf;
  }

  p.remove = function(node) {
    var found = false;
    for (var i = 0; i < this.children.length; i++) {
      if (this.children[i] == node)
        found = true;
      if (found && i < this.children.length - 1)
        this.children[i] = this.children[i + 1];
    }
    if (found) {
      this.children.length = this.children.length - 1;
      this.model.tree.renderer.removeNode(node);
    }
  }
};

org.xwidgets.core.TreeModel = function(rootNode) {
  this.rootNode = rootNode;
  this.rootNode.setModel(this);
  this.tree = null;
  var p = org.xwidgets.core.TreeModel.prototype;
  
  p.getChild = function(parent, index) {
    return parent.getChildAt(index);
  }

  p.getChildCount = function(parent) {
    return parent.getChildCount();
  }

  p.getIndexOfChild = function(parent, child) {
    return parent.getIndex(child);
  }

  p.getRoot = function() {
    return this.rootNode;
  }

  p.isLeaf = function(node) {
    return node.isLeaf();
  }

  p.setTree = function(tree) {
    this.tree = tree;
  }

  p.findNodeByObject = function(object) {
    return this.searchChildrenForObject(this.rootNode, object);
  }

  p.searchChildrenForObject = function(node, object) {
    for (var i = 0; i < node.getChildCount(); i++) {
      var childNode = node.getChildAt(i);
      if (childNode.getUserObject() == object) {
        return childNode;
      } else if (childNode.getChildCount() > 0) {
        grandChild = this.searchChildrenForObject(childNode, object);
        if (grandChild != null)
          return grandChild;
      }
    }
    return null;
  }
};

org.xwidgets.core.TreeModel.parse = function(model) {
  return new org.xwidgets.core.TreeModel(org.xwidgets.core.TreeModel.parseNode(model));
};

org.xwidgets.core.TreeModel.parseNode = function(nodeObject) {
  var node = new org.xwidgets.core.TreeNode(nodeObject.value, nodeObject.leafNode, nodeObject.userObject);
  if (xw.Sys.isDefined(nodeObject.children)) {
    for (var i = 0; i < nodeObject.children.length; i++) {
      node.add(org.xwidgets.core.TreeModel.parseNode(nodeObject.children[i]));
    }
  }
  return node;
};

org.xwidgets.core.TreeUtil = {
  setOpacity : function(ctl, percent) {
    if (navigator.userAgent.indexOf("MSIE") != -1) 
      ctl.style.filter = "alpha(opacity=" + percent + ")";
    else
      ctl.style.MozOpacity = percent / 100;
  },
  fades : new Array(),
  fading : false,
  startFade : function(fade) {
    fade.valid = true;

    if (fade.value == 0) {
      fade.control.style.display = "";
    }

    org.xwidgets.core.TreeUtil.fades.push(fade);

    if (!org.xwidgets.core.TreeUtil.fading) {
      org.xwidgets.core.TreeUtil.processFades();
    }
  },
  fadeIn : function(ctl, step) {
    org.xwidgets.core.TreeUtil.setOpacity(ctl, 0);
    org.xwidgets.core.TreeUtil.startFade({control:ctl,value:0,step:step});
  },
  fadeOut : function(ctl, step, onComplete) {
    org.xwidgets.core.TreeUtil.setOpacity(ctl, 100);
    org.xwidgets.core.TreeUtil.startFade({control:ctl,value:100,step:-1 * step,onComplete:onComplete});
  },
  processFades : function() {
    org.xwidgets.core.TreeUtil.fading = true;
    var u = org.xwidgets.core.TreeUtil;

    for (var i = 0; i < u.fades.length; i++) {
      var fade = u.fades[i];
      var done = false;

      if (fade.step < 0) {// Fade out
        u.setOpacity(fade.control, Math.max(fade.value, 0));
        if (fade.value < 0) {
          done = true;
        }
      } else if (fade.step > 0) { // Fade in
        u.setOpacity(fade.control, Math.min(fade.value, 100));
        if (fade.value > 100) {
          done = true;
        }
      }

      if (done){
        u.fades.splice(i, 1);
        if (fade.onComplete) {
          fade.onComplete();
        }
      }
      fade.value += fade.step;
    }

    if (u.fades.length > 0) {
      setTimeout("org.xwidgets.core.TreeUtil.processFades()", 50);
    } else {
      u.fading = false;
    }
  },
  getMousePos : function(event) {
    var x, y;
    if (navigator.userAgent.indexOf("MSIE") != -1) {
      x = window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
      y = window.event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
    } else {
      x = event.clientX + window.scrollX;
      y = event.clientY + window.scrollY;
    }
    return { x:x, y:y };
  },
  calcDistance : function(pos1, pos2) {
    var deltaX = Math.abs(pos1.x - pos2.x);
    var deltaY = Math.abs(pos1.y - pos2.y);
    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  }
};

org.xwidgets.core.Tree = function() {
  xw.Visual.call(this);
  this._className = "org.xwidgets.core.Tree";

  this.rootVisible = false;  
  this.model = null;
  this.renderer = new org.xwidgets.core.DefaultTreeRenderer();
  this.onSelect = null;
  this.onDragDrop = null;
  this.selectedNode = null;
};

// Global tree variables
org.xwidgets.core.Tree.mouseDownNode = null;
org.xwidgets.core.Tree.draggedNode = null;
org.xwidgets.core.Tree.mouseDownStartPos = null;
org.xwidgets.core.Tree.dragThreshold = 5;
org.xwidgets.core.Tree.dragDiv = null;
org.xwidgets.core.Tree.targetNode = null;

org.xwidgets.core.Tree.prototype = new xw.Visual();

org.xwidgets.core.Tree.prototype.isRootVisible = function() {
  return this.rootVisible;
};

org.xwidgets.core.Tree.prototype.setRootVisible = function(visible) {
  this.rootVisible = visible;
};

org.xwidgets.core.Tree.prototype.render = function(container) {
  this.renderer.render(this, container, this.model.getRoot(), true);
};

org.xwidgets.core.Tree.prototype.repaintNode = function(node) {
  this.renderer.render(this, null, node, true);
};

org.xwidgets.core.Tree.prototype.getModel = function() {
  return this.model;
};

org.xwidgets.core.Tree.prototype.setModel = function(model) {
  this.model = model;
  this.model.setTree(this);
};

org.xwidgets.core.Tree.prototype.selectNode = function(node) {
  if (this.selectedNode) {
    this.renderer.renderSelected(this.selectedNode, false);
  }
  this.selectedNode = node;
  this.renderer.renderSelected(node, true);
  if (this.onSelect) {
    this.onSelect(node);
  }
};

org.xwidgets.core.Tree.prototype.initiateDragDrop = function(sourceNode, targetNode) {
  if ((this.onDragDrop && this.onDragDrop(sourceNode, targetNode)) || !this.onDragDrop) {
    this.moveNode(sourceNode, targetNode);
  }
};

org.xwidgets.core.Tree.prototype.moveNode = function(sourceNode, targetNode) {
  var sourceParent = sourceNode.getParent();
  if (sourceParent != targetNode) {
    sourceParent.remove(sourceNode);

    targetNode.add(sourceNode);

    targetNode.childrenCell.appendChild(sourceNode.tableCtl);
    this.repaintNode(sourceParent);

    targetNode.expanded = true;
    this.repaintNode(targetNode);
  }
};

// Global tree methods

org.xwidgets.core.Tree.onMouseDown = function(event, node) {
  org.xwidgets.core.Tree.mouseDownStartPos = org.xwidgets.core.TreeUtil.getMousePos(event);
  org.xwidgets.core.Tree.mouseDownNode = node;
  
  xw.Sys.chainEvent(document, "mousemove", org.xwidgets.core.Tree.onMouseMove);
  xw.Sys.chainEvent(document, "mouseup", org.xwidgets.core.Tree.onMouseUp);

  xw.Log.info("onMouseDown - events chained");

  // Prevent the default browser behaviour (of selecting text)
  xw.Sys.cancelEventBubble(event);
};

org.xwidgets.core.Tree.onMouseMove = function(event) {
  xw.Log.info("onMouseMove");

  var t = org.xwidgets.core.Tree;
  var u = org.xwidgets.core.TreeUtil;
  if (t.draggedNode == null) {
    var distance = u.calcDistance(u.getMousePos(event), t.mouseDownStartPos);
    if (distance > t.dragThreshold)
    {
      t.draggedNode = t.mouseDownNode;
      if (t.dragDiv == null)
      {
        t.targetNode = null;
        t.dragDiv = document.createElement("div");
        t.dragDiv.style.position = "absolute";
        u.setOpacity(t.dragDiv, 40);
        window.document.body.appendChild(t.dragDiv);
      }

      t.draggedNode.renderer.renderClone(t.dragDiv, t.draggedNode);
      t.dragDiv.style.display = "";
      var pos = u.getMousePos(event);
      t.dragDiv.style.left = (pos.x + 10) + "px";
      t.dragDiv.style.top = pos.y + "px";
    }
  }
  else
  {
    var pos = u.getMousePos(event);
    t.dragDiv.style.left = (pos.x + 10) + "px";
    t.dragDiv.style.top = pos.y + "px";
  }
};

org.xwidgets.core.Tree.onMouseUp = function(event) {
  var t = org.xwidgets.core.Tree;
  xw.Sys.unchainEvent(document, "mousemove", t.onMouseMove);
  xw.Sys.unchainEvent(document, "mouseup", t.onMouseUp);
  
  xw.Log.info("onMouseUp - events unchained");
  
  t.mouseDownStartPos = null;

  if (t.dragDiv) {
    t.dragDiv.style.display = "none";
  }

  if (t.targetNode) {
    t.targetNode.renderer.renderSelected(t.targetNode, false);
    t.draggedNode.model.tree.initiateDragDrop(t.draggedNode, t.targetNode);
  } else if (t.mouseDownNode.model && t.mouseDownNode.model.tree && !t.draggedNode) {
    t.mouseDownNode.model.tree.selectNode(t.mouseDownNode);
  }

  t.targetNode = null;
  t.draggedNode = null;

  // Prevent the default browser behaviour
  xw.Sys.cancelEventBubble(event);
};

org.xwidgets.core.Tree.onMouseOver = function(event, node) {
  var t = org.xwidgets.core.Tree;
  if (t.draggedNode && t.draggedNode != node && !node.isLeaf() && t.draggedNode.getParent() != node) {
    node.renderer.renderSelected(node, true);
    t.targetNode = node;
  }
};

org.xwidgets.core.Tree.onMouseOut = function(event, node) {
  var t = org.xwidgets.core.Tree;
  if (t.draggedNode && t.draggedNode != node && !node.isLeaf()) {
    node.renderer.renderSelected(node, false);
    if (t.targetNode == node) {
      t.targetNode = null;
    }
  }
};

org.xwidgets.core.DefaultTreeRenderer = function() {
  this.plusStartClass = "treePlusStart";
  this.plusMiddleClass = "treePlusMiddle";
  this.plusEndClass = "treePlusEnd";
  this.plusNoneClass = "treePlusNone";

  this.minusStartClass = "treeMinusStart";
  this.minusMiddleClass = "treeMinusMiddle";
  this.minusEndClass = "treeMinusEnd";
  this.minusNoneClass = "treeMinusNone";

  this.lineMiddleClass = "treeLineMiddle";
  this.lineEndClass = "treeLineEnd";
  this.lineBranchClass = "treeLineBranch";

  this.leafClass = "treeLeaf";
  this.folderOpenClass = "treeFolderOpen";
  this.folderClosedClass = "treeFolderClosed";

  this.onRender = false;
};

org.xwidgets.core.DefaultTreeRenderer.prototype.removeNode = function(node) {
  node.parent.childrenCell.removeChild(node.tableCtl);
};

org.xwidgets.core.DefaultTreeRenderer.prototype.render = function(tree, container, node, renderChildren) {
  if (!node.tableCtl) {
    node.renderer = this;

    node.tableCtl = document.createElement("table");
    node.tableCtl.cellSpacing = 0;
    node.tableCtl.cellPadding = 0;

    node.headerRow = node.tableCtl.insertRow(-1);

    node.branchCell = node.headerRow.insertCell(-1);
    node.iconCell = node.headerRow.insertCell(-1);
    node.contentCell = node.headerRow.insertCell(-1);

    node.contentCell.style.textAlign = "left";
    node.contentCell.style.whiteSpace = "nowrap";
    node.contentCell.style.cursor = "pointer";
    node.contentCell.style.verticalAlign = "middle";

    node.branchDiv = document.createElement("div");

    var toggleFunction = function(event) { node.expanded = !node.expanded; node.renderer.toggle(node); };

    xw.Sys.chainEvent(node.branchDiv, "mousedown", toggleFunction);

    node.branchCell.appendChild(node.branchDiv);

    node.iconDiv = document.createElement("div");
    node.iconDiv.style.position = "static";

    node.iconCell.style.width = "1px";
    node.iconCell.style.cursor = "pointer";
    node.iconCell.appendChild(node.iconDiv);

    node.content = document.createElement("span");
    node.content.className = "unselected";
    node.contentText = document.createTextNode(node.value);
    node.content.appendChild(node.contentText);

    node.contentCell.appendChild(node.content);

    node.childrenRow = node.tableCtl.insertRow(-1);
    node.childBranchCell = node.childrenRow.insertCell(-1);

    node.childBranchDiv = document.createElement("div");
    node.childBranchCell.appendChild(node.childBranchDiv);

    node.childrenCell = node.childrenRow.insertCell(-1);
    node.childrenCell.colSpan = 2;
    
    var t = org.xwidgets.core.Tree;

    var mouseDownFunction = function(event) { t.onMouseDown(event, node); };
    xw.Sys.chainEvent(node.iconDiv, "mousedown", mouseDownFunction);
    xw.Sys.chainEvent(node.contentCell, "mousedown", mouseDownFunction);

    var mouseOverFunction = function(event) { t.onMouseOver(event, node); };
    xw.Sys.chainEvent(node.iconDiv, "mouseover", mouseOverFunction);
    xw.Sys.chainEvent(node.contentCell, "mouseover", mouseOverFunction);

    var mouseOutFunction = function(event) { t.onMouseOut(event, node); };
    xw.Sys.chainEvent(node.iconDiv, "mouseout", mouseOutFunction);
    xw.Sys.chainEvent(node.contentCell, "mouseout", mouseOutFunction);
  }

  node.contentText.nodeValue = node.value;

  if (container) {
    var inContainer = false;
    for (var i = 0; i < container.childNodes.length; i++) {
      if (container.childNodes[i] == node.tableCtl) {
        inContainer = true;
        break;
      }
    }

    if (!inContainer) {
      container.appendChild(node.tableCtl);
    }
  }

  if (!node.isLeaf() && renderChildren) {
    for (var i = 0; i < node.getChildCount(); i++) {
      this.render(tree, node.childrenCell, node.getChildAt(i), true);
    }
  }

  // Reset the child branch div height
  node.childBranchDiv.style.height = "100%";

  var expanded = node.expanded && (node.getChildCount() > 0);
//    node.childrenRow.style.display = expanded ? "" : "none";

  if (node.isLeaf()) {
    if (node.getParent() == null) {
      node.branchDiv.className = this.lineBranchClass;
    } else if (node.getParent().getIndex(node) == node.getParent().getChildCount() - 1) {
      node.branchDiv.className = this.lineEndClass;
    } else {
      node.branchDiv.className = this.lineBranchClass;
    }

    node.iconDiv.className = this.leafClass;
  } else {
    if (node.getParent() == null) {
      if (node.getChildCount() > 0) {
        node.branchDiv.className = expanded ? this.minusNoneClass : this.plusNoneClass;
      } else {
        node.branchDiv.className = "";
      }
    } else if (node.getParent().getIndex(node) == node.getParent().getChildCount() - 1) {
      if (node.getChildCount() > 0) {
        node.branchDiv.className = expanded ? this.minusEndClass : this.plusEndClass;
        node.childBranchDiv.className = "";
        node.childBranchDiv.style.width = "100%";
      } else {
        node.branchDiv.className = this.lineEndClass;
      }
    } else {
      if (node.getChildCount() > 0) {
        node.childBranchDiv.className = this.lineMiddleClass;
        node.childBranchDiv.style.height = node.childBranchCell.offsetHeight + "px";
        node.branchDiv.className = expanded ? this.minusMiddleClass : this.plusMiddleClass;
      } else {
        node.branchDiv.className = this.lineBranchClass;
      }
    }
    node.iconDiv.className = expanded ? this.folderOpenClass : this.folderClosedClass;
  }

  if (node.getParent()) {
    node.renderer.render(tree, null, node.getParent());
  }

  if (this.onRender) {
    this.onRender(node);
  }

  node.childrenRow.style.display = expanded ? "" : "none";
};

org.xwidgets.core.DefaultTreeRenderer.prototype.toggle = function(node) {
  if (node.expanded) {
    // Reset the child branch div height
    node.childrenRow.style.display = "";
    org.xwidgets.core.TreeUtil.fadeIn(node.childrenCell, 25);
    this.decorateNode(node, true);
  } else {
    this.decorateNode(node, false);
    var onComplete = function() { node.childrenRow.style.display = "none"; node.renderer.decorateNode(node, true); };
    org.xwidgets.core.TreeUtil.fadeOut(node.childrenCell, 34, onComplete);
  }
};

org.xwidgets.core.DefaultTreeRenderer.prototype.decorateNode = function(node, recurseUp) {
  node.childBranchDiv.style.height = "0px";

  if (node.isLeaf()) {
    if (node.getParent() == null) {
      node.branchDiv.className = this.lineBranchClass;
    } else if (node.getParent().getIndex(node) == node.getParent().getChildCount() - 1) {
      node.branchDiv.className = this.lineEndClass;
    } else {
      node.branchDiv.className = this.lineBranchClass;
    }

    node.iconDiv.className = this.leafClass;
  } else {
    if (node.getParent() == null) {
      if (node.getChildCount() > 0) {
        node.branchDiv.className = node.expanded ? this.minusNoneClass : this.plusNoneClass;
      } else {
        node.branchDiv.className = "";
      }
    } else if (node.getParent().getIndex(node) == node.getParent().getChildCount() - 1) {
      if (node.getChildCount() > 0) {
        node.branchDiv.className = node.expanded ? this.minusEndClass : this.plusEndClass;
        node.childBranchDiv.className = "";
        node.childBranchDiv.style.width = "100%";
      } else {
        node.branchDiv.className = this.lineEndClass;
      }
    } else {
      if (node.getChildCount() > 0) {
        node.childBranchDiv.className = this.lineMiddleClass;
        node.childBranchDiv.style.height = node.childBranchCell.offsetHeight + "px";
        node.branchDiv.className = node.expanded ? this.minusMiddleClass : this.plusMiddleClass;
      } else {
        node.branchDiv.className = this.lineBranchClass;
      }
    }
    node.iconDiv.className = node.expanded ? this.folderOpenClass : this.folderClosedClass;
  }

  if (node.getParent() && recurseUp) {
    node.renderer.decorateNode(node.getParent(), true);
  }
};

org.xwidgets.core.DefaultTreeRenderer.prototype.renderSelected = function(node, selected) {
  node.content.className = selected ? "selected" : "unselected";
};

org.xwidgets.core.DefaultTreeRenderer.prototype.renderClone = function(container, node) {
  var tbl = document.createElement("table");
  tbl.cellSpacing = 0;
  tbl.cellPadding = 0;
  var row = tbl.insertRow(-1);
  row.appendChild(node.iconCell.cloneNode(true));
  row.appendChild(node.contentCell.cloneNode(true));

  if (container.firstChild) {
    container.replaceChild(tbl, container.firstChild);    
  } else {
    container.appendChild(tbl);
  }
};


