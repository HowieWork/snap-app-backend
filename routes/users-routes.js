const { Router } = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');

const router = Router();

// .../ NOTE Retrieve a list of users
router.get('/', usersController.getUsers);

// .../signup NOTE Sign up
router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 }),
  ],
  usersController.signUp
);

// .../login NOTE Log in
router.post('/login', usersController.logIn);

module.exports = router;
