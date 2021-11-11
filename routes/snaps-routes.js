const express = require('express');

const snapsController = require('../controllers/snaps-controllers');

// CREATE A ROUTER OBJECT
const router = express.Router();

// ROUTE: .../:sid NOTE Get a specific snap by snap id (sid)
router.get('/:sid', snapsController.getSnapBySnapId);

// ROUTE: .../user/:uid NOTE Retrieve a list of all snaps for a given user id (uid)
router.get('/user/:uid', snapsController.getSnapsByUserId);

// ROUTE: .../ NOTE Create a new snap
router.post('/', snapsController.createSnap);

// ROUTE: .../:sid NOTE Update an existing snap
router.patch('/:sid', snapsController.updateSnap);

// ROUTE: .../:sid NOTE Delete an existing snap
router.delete('/:sid', snapsController.deleteSnap);

module.exports = router;
