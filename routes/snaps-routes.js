const { Router } = require('express');
const { check } = require('express-validator');

const snapsController = require('../controllers/snaps-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

// 1. CREATE SNAPS ROUTER OBJECT
const router = Router();

// 2. CREATE ROUTES
// 1) .../random
// NOTE Randomly generate a snap
router.get('/random', snapsController.getRandomSnap);

// 2) .../search/:keyword
// NOTE Get matching snaps by keyword
router.get('/search/:keyword', snapsController.getSnapsByKeyword);

// 3) .../:sid
// NOTE Get a specific snap by snap id (sid)
router.get('/:sid', snapsController.getSnapBySnapId);

// 4) .../user/:uid
// NOTE Retrieve a list of all snaps for a given user id (uid)
router.get('/user/:uid', snapsController.getSnapsByUserId);

// 5) ADD AUTH MIDDLEWARE FOR PROTECTED ROUTES BELOW *WILL PASS CREATOR INFO TO FUTURE CREATED SNAP DOCUMENT
router.use(checkAuth);

// 6) .../
// NOTE Create a new snap
router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  snapsController.createSnap
);

// 7) .../:sid
// NOTE Update an existing snap
router.patch(
  '/:sid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  snapsController.updateSnap
);

// 8) .../:sid
// NOTE Delete an existing snap
router.delete('/:sid', snapsController.deleteSnap);

// 3. EXPORT SNAPS ROUTER
module.exports = router;
