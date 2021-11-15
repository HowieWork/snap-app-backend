const { Router } = require('express');
const { check } = require('express-validator');

const snapsController = require('../controllers/snaps-controllers');

// CREATE A ROUTER OBJECT
const router = Router();

// ROUTE: .../:sid
// Get a specific snap by snap id (sid)
router.get('/:sid', snapsController.getSnapBySnapId);

// ROUTE: .../user/:uid
// Retrieve a list of all snaps for a given user id (uid)
router.get('/user/:uid', snapsController.getSnapsByUserId);

// ROUTE: .../
// Create a new snap
router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  snapsController.createSnap
);

// ROUTE: .../:sid
// Update an existing snap
router.patch(
  '/:sid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  snapsController.updateSnap
);

// ROUTE: .../:sid
// Delete an existing snap
router.delete('/:sid', snapsController.deleteSnap);

module.exports = router;
