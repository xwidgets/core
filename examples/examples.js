function renderView() {
  var rootNode = xw.Sys.parseXml(document.getElementById("src").value);   
  xw.Controller.openView(
    new xw.View(), 
    new xw.DefinitionParser().parse(rootNode.childNodes[0]), 
    null, 
    "content"
  );
}
