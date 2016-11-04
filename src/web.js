(async () => {
  require('dotenv').config({ silent: true });

  const db = await require('mongodb').MongoClient.connect(process.env.MONGODB_URI);

  const migrator = new (require('mongodb-migrations').Migrator)({
    collection: 'migrations',
    url: process.env.MONGODB_URI,
  });
  await new Promise(resolve => migrator.runFromDir(require('path').join(__dirname, '/migrations'), resolve));

  const connectEnsureLogin = require('connect-ensure-login');
  const ensureLoggedIn = connectEnsureLogin.ensureLoggedIn();
  const ensureLoggedOut = connectEnsureLogin.ensureLoggedOut();

  const express = require('express');
  const app = express();

  app.use(await require('./routers/authenticate')({ db, ensureLoggedOut }));
  app.use(await require('./routers/home')({ db }));
  app.use(await require('./routers/profile')({ db, ensureLoggedIn }));

  app.use(express.static('www'));

  app.listen(process.env.PORT);
})();
