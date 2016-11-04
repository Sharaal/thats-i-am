const dbcrypt = require('dbcrypt');
const ObjectId = require('mongodb').ObjectId;
const passport = require('passport');

module.exports = async ({ db, ensureLoggedOut }) => {
  const authentications = db.collection('authentications');
  const users = db.collection('users');

  passport.deserializeUser(
    async (_id, cb) => {
      const user = await users.findOne({ _id: new ObjectId(_id) });
      cb(null, user);
    }
  );

  passport.serializeUser(
    async (user, cb) => {
      cb(null, user._id);
    }
  );

  passport.use(new (require('passport-local').Strategy)(
    async (name, password, cb) => {
      const authentication = await authentications.findOne({ strategy: 'local', name });
      if (authentication && await dbcrypt.compare(password, authentication.passwordHash)) {
        const user = await users.findOne({ _id: new ObjectId(authentication.userId) });
        cb(null, user);
      } else {
        cb(null, null);
      }
    })
  );

  const router = require('express').Router();

  router.use(require('body-parser').urlencoded({ extended: true }));
  router.use(require('cookie-parser')());
  router.use(require('express-session')({ resave: false, saveUninitialized: false, secret: 'secret' }));
  router.use(passport.initialize());
  router.use(passport.session());

  router.route('/register')
    .get(
      ensureLoggedOut,
      (req, res) => {
        res.render('register.ejs');
      })
    .post(
      async (req, res) => {
        const result = await users.insertOne({ name: req.body.name });
        const userId = result.insertedId;
        const passwordHash = await dbcrypt.hash(req.body.password);
        await authentications.insertOne({ strategy: 'local', name: req.body.name, passwordHash, userId });
        res.redirect('/login');
      }
    );

  router.route('/login')
    .get(
      ensureLoggedOut,
      (req, res) => {
        res.render('login.ejs');
      })
    .post(
      passport.authenticate('local', { failureRedirect: '/login', successReturnToOrRedirect: '/' })
    );

  router.get('/logout',
    (req, res) => {
      if (req.user) {
        req.logout();
      }
      res.redirect('/');
    }
  );

  return router;
};
