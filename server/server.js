'use strict';

/*
 *
 * Entry file into the server
 * @app -
 *    our express app. Exported for testing and flexibility.
 *
*/

var app   = require('./main/app.js'),
    port  = app.get('port'),
    ip = app.get('base url'),
    log   = 'Listening on ' + ip + ':' + port;

app.listen(port, ip);
console.log(log);
