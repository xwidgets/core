'use strict';

var morgan      = require('morgan'),
    bodyParser  = require('body-parser'),
    middle      = require('./middleware');

module.exports = exports = function (app, express, routers) {
  app.set('port', process.env.PORT || 9000);
  app.set('base url', process.env.URL || '0.0.0.0');
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(middle.cors);
  var staticRoot = __dirname + '/../../client/src';
  //app.use('/app', express.static(staticRoot + '/'));
  app.use(express.static(staticRoot));
  //app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
 //   res.sendFile('index.html', { root: staticRoot });
//  });
  app.use(middle.logError);
  app.use(middle.handleError);
};
