'use strict';

var _ = require('underscore')
  ;

var opts = {
  paths: {
    server: {
      specs: 'server/**/*.spec.js'
    }
  }
, lrPort: 35729
, frontend: {
    hostname: 'localhost'
  , port: process.env.PORT || '9000'
  }
};

module.exports = function(gulp, baseOpts) {
  var newOpts = _.extend({}, baseOpts, opts);
  return newOpts;
};
