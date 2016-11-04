module.exports = () => {
  const router = require('express').Router();

  router.get('/',
    (req, res) => {
      res.render('home.ejs', { user: req.user });
    }
  );

  return router;
};
