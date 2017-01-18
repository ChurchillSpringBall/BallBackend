module.exports = function (server) {
  var router = server.loopback.Router();
  router.get('/auth/success', function (req, res, next) {
    res.redirect(require('../config').appUrl + '/#/passport/');
  });
  server.use(router);
};
