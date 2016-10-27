'use strict';

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/api/status', server.loopback.status());
  server.use(router);
};
