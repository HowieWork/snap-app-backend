const { Router } = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

// 1. CREATE USER ROUTER OBJECT
const router = Router();

// 2. CREATE ROUTES
// 1) .../
// NOTE Retrieve a list of users
router.get('/', usersController.getUsers);

// 2) .../signup
// NOTE Sign up
router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('motto').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 }),
  ],
  usersController.signUp
);

// 3) .../login
// NOTE Log in
router.post('/login', usersController.logIn);

// 3. EXPORT USER ROUTER
module.exports = router;
