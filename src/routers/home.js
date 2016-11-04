module.exports = ({ db }) => {
  const users = db.collection('users');

  const router = require('express').Router();

  router.get('/',
    async (req, res) => {
      res.render('home.ejs', { user: req.user, users: await users.find({}).toArray() });
    }
  );

  return router;
};
