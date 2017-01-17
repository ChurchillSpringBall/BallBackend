'use strict';

const path = require('path');

const loopback = require('loopback');
const boot = require('loopback-boot');

const app = module.exports = loopback();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const errorHandler = require('strong-error-handler');

// Create an instance of PassportConfigurator with the app instance
const PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
const passportConfigurator = new PassportConfigurator(app);
const providers = require('./providers.json');

// null properties break swagger so we delete them to view the api
app.get('/explorer/swagger.json', (req, res, next) => {
  const _send = res.send;
  res.send = (data) => {
    if (data && data.definitions) {
      //A proper function could be written for this but its a fairly small model
      delete data.definitions.Ticket.properties.admittedAt.default;
      delete data.definitions.Ticket.properties.collectedAt.default;
    }
    _send.apply(res, [data]);
  };
  next();
});

app.start = () => {
  // start the web server
  return app.listen(() => {

    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);

    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });

};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, (error) => {
  if (error) throw error;

  app.middleware('auth', loopback.token({ model: app.models.accessToken }));  // TODO: check if token + session should be used?]
  // app.middleware('session:before', cookieParser(app.get('cookieSecret')));
  app.middleware('session', session({
    secret: '9g2b4fchiuhfn2eocfin2ea2fv3wrgv350jino45gn',
    saveUninitialized: false,
    resave: false
    // TODO: configure session store
  }));

  // Initialize passport
  passportConfigurator.init(false);

  // Set up related models
  passportConfigurator.setupModels({
    userModel: app.models.user,
    userIdentityModel: app.models.UserIdentity,
    userCredentialModel: app.models.UserCredential
  });

  // Configure passport strategies for third party auth providers
  for (let s in providers) {
    let c = providers[s];
    c.session = c.session !== false;
    passportConfigurator.configureProvider(s, c);
  }

  app.use('/api', loopback.rest());
  app.use(loopback.static(path.resolve(__dirname, app.get('clientDir'))));  // TODO: set up nginx to serve non-auth/api urls?
  // app.use(loopback.urlNotFound());
  // app.use(errorHandler());
  // app.enableAuth(); should be enabled in /boot
  app.use(flash());

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();


});

