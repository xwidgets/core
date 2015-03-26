XWidgets
========

What is it?
-----------
XWidgets is a component-based framework for HTML5.

Latest source code
------------------
You can find the latest version of XWidgets at https://github.com/xwidgets.

Maven dependencies
------------------
If your project is Maven-based, you can modify your pom.xml as follows to enable XWidgets:

First add a version property in the <properties> section:

  <version.xwidgets>0.1-SNAPSHOT</version.xwidgets>

Then under <dependencies>, add the following dependency declaration:

  <dependency>
    <groupId>org.xwidgets</groupId>
    <artifactId>xwidgets</artifactId>
    <version>${version.xwidgets}</version>
  </dependency>
  
The XWidgets Maven dependencies are available from Maven Central.

Getting Started
---------------
For a Java-based application, the XWidgets Maven dependency provides a resource servlet that allows the XWidgets JavaScript files and other resources to be served via the /xwidgets path.  For a non Java-based application, it is recommended that you copy all of the XWidgets files to a directory of your web application (e.g. scripts/xwidgets).

Once the XWidgets scripts have been made available, simply add the following <script> tag to the <head> section of your html source, adjusting the src value as necessary:

<html>
  <head>
    <script src="xwidgets/xw.js" type="text/javascript"></script>
  </head>
  <body>
  
  </body>
</html>

The xw.js script contains the core XWidgets framework.  All JavaScript functions and objects defined by XWidgets are contained within the "xw" namespace so as not to conflict with other JavaScript frameworks.

