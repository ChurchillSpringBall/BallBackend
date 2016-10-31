module.exports = function (server) {
  var router = server.loopback.Router();
  router.get('/auth/success', function (req, res, next) {
    res.redirect('http://131.111.202.70:8000/#/passport/');
  });
  server.use(router);
};
