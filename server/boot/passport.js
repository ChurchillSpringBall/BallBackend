module.exports = function (server) {
  var router = server.loopback.Router();
  router.get('/auth/success', function (req, res, next) {
    res.redirect('http://' + require('../config').baseUrl + '/#/passport/');
  });
  server.use(router);
};
