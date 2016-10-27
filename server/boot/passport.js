module.exports = function (server) {
  var router = server.loopback.Router();
  router.get('/auth/success', function (req, res, next) {
    res.redirect('http://localhost:3001/#/passport/');
  });
  server.use(router);
};
