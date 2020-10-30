const Users = require('./../../models/Users'),
  express = require('express'),
  passport = require('passport'),
  router = express.Router();

// Enable authentication
const auth = passport.authenticate('jwt', { session: false });

// @route    POST api/users
// @desc     Register a new user account
// @access   Public
router.post('/', (req, res) => {
  Users.findOne({ Username: req.body.Username }).then((user) => {
    if (user) {
      return res.status(400).send(`${req.body.Username} already exists!`);
    } else {
      Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      })
        .then((user) => {
          res.status(201).json(user);
        })
        .catch((err) => {
          res.status(500).send(`Error: ${err}`);
        });
    }
  });
});

// @route    PUT api/users/:Username
// @desc     Update user information
// @access   Private
router.put('/:Username', auth, (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      } else {
        res.status(201).json(updatedUser);
      }
    }
  );
});

// @route    POST api/users/:Username/:MovieID
// @desc     Add a movie to user's favorites
// @access   Private
router.post('/:Username/:MovieID', auth, (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $push: { FavoriteMovies: req.params.MovieID } },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      } else {
        res.status(201).json(updatedUser.FavoriteMovies);
      }
    }
  );
});

// @route    DELETE api/users/:Username/:MovieID
// @desc     Remove a movie from user's favorites
// @access   Private
router.delete('/:Username/:MovieID', auth, (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      } else {
        res.status(201).json(updatedUser.FavoriteMovies);
      }
    }
  );
});

// @route    DELETE api/users/:Username
// @desc     Remove a user's account
// @access   Private
router.delete('/:Username', auth, (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res
          .status(400)
          .send(
            `No account with the username "${req.params.Username}" was found.`
          );
      } else {
        res
          .status(200)
          .send(`${req.params.Username}'s account was successfully deleted.`);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error: ${err}`);
    });
});

module.exports = router;