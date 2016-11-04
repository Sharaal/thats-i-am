const ObjectId = require('mongodb').ObjectId;

module.exports = async ({ db, ensureLoggedIn }) => {
  const users = db.collection('users');

  const router = require('express').Router();

  router.route('/profile')
    .get(
      ensureLoggedIn,
      (req, res) => {
        res.render('me.ejs', { user: req.user });
      }
    )
    .post(
      ensureLoggedIn,
      async (req, res) => {
        await users.updateOne(
          { _id: new ObjectId(req.user._id) },
          { $set: {
            portrait: req.body.portrait,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            job: req.body.job,
            company: req.body.company,
            location: req.body.location,
            blockquote: req.body.blockquote,
            email: req.body.email,
          } }
        );
        res.redirect('/');
      }
    );

  router.get('/profile',
    ensureLoggedIn,
    (req, res) => {
      res.render('me.ejs', { user: req.user });
    }
  );

  router.get('/profile/:name',
    async (req, res) => {
      const user = await users.findOne({ name: req.params.name });
      if (user) {
        if (req.accepts('html')) {
          res.render('you.ejs', { user });
        } else {
          res.send(user);
        }
      } else {
        res.sendStatus(404);
      }
    }
  );

  return router;
};
