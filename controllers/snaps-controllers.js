const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Snap = require('../models/snap');

let DUMMY_SNAPS = [
  {
    id: 's1',
    title: 'Guggenheim',
    description:
      'The unique architecture of the space, with its spiral ramp riding to a domed skylight, continues to thrill visitors and provide a unique forum.',
    imageUrl:
      'https://images.unsplash.com/photo-1526743971139-a05541356e8d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
    address: '1071 5th Ave, New York',
    location: {
      lat: 40.7829796,
      lng: -73.9611593,
    },
    creator: 'u1',
  },
  ,
  {
    id: 's3',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: 'u2',
  },
];

// CRUD
// 1) CREATE
const createSnap = async (req, res, next) => {
  // VALIDATING INPUTS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs. Please enter correct information.', 422)
    );
  }

  const { title, description, imageUrl, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  // CREATE NEW SNAP DOCUMENT
  const createdSnap = new Snap({
    title,
    description,
    imageUrl,
    address,
    location: coordinates,
    creator,
  });
  // SAVE NEW SNAP DOCUMENT
  try {
    await createdSnap.save();
  } catch {
    const error = new HttpError('Creating snap failed, please try again.', 500);
    return next(error);
  }

  res.status(201).json({ snap: createdSnap });
};

// 2) READ
const getSnapBySnapId = async (req, res, next) => {
  const snapId = req.params.sid;

  let snap;
  try {
    snap = await Snap.findById(snapId);
  } catch {
    const error = new HttpError(
      'Something went wrong, could not find a snap.',
      500
    );
    return next(error);
  }

  if (!snap) {
    return next(
      new HttpError('Could not find the snap for the provided id.', 404)
    );
  }

  // NOTE toObject(): Converts this document into a plain-old JavaScript object (POJO).
  res.status(200).json({ snap: snap.toObject({ getters: true }) });
};

const getSnapsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let snaps;
  try {
    snaps = await Snap.find({ creator: userId });
  } catch {
    const error = new HttpError(
      'Something went wrong, could not find snaps for this user.',
      500
    );
    return next(error);
  }

  if (!snaps || snaps.length === 0) {
    return next(
      new HttpError('Could not find snaps for the provided user id.', 404)
    );
  }

  res
    .status(200)
    .json({ snaps: snaps.map((snap) => snap.toObject({ getters: true })) });
};

// 3) UPDATE
const updateSnap = async (req, res, next) => {
  // VALIDATING INPUTS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // FIXME Delete
    console.log(errors);
    return next(
      new HttpError('Invalid inputs. Please enter correct information.', 422)
    );
  }

  const { title, description } = req.body;
  const snapId = req.params.sid;

  let snap;
  try {
    snap = await Snap.findById(snapId);
  } catch {
    const error = new HttpError(
      'Something went wrong, could not update snap',
      500
    );
    return next(error);
  }

  if (!snap) {
    return next(new HttpError('Could not find the snap.', 404));
  }

  snap.title = title;
  snap.description = description;

  try {
    await snap.save();
  } catch {
    const error = new HttpError(
      'Something went wrong, could not update snap',
      500
    );
    return next(error);
  }

  res.status(200).json({ snap: snap.toObject({ getters: true }) });
};

// 4) DELETE
const deleteSnap = async (req, res, next) => {
  const snapId = req.params.sid;

  let snap;
  try {
    snap = await Snap.findById(snapId);
  } catch {
    const error = new HttpError(
      'Something went wrong, could not delete snap',
      500
    );
    return next(error);
  }

  if (!snap) {
    return next(new HttpError('Could not find the snap.', 404));
  }

  try {
    await snap.remove();
  } catch {
    const error = new HttpError(
      'Something went wrong, could not delete snap',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'You have successfully deleted the snap.' });
};

exports.createSnap = createSnap;
exports.getSnapBySnapId = getSnapBySnapId;
exports.getSnapsByUserId = getSnapsByUserId;
exports.updateSnap = updateSnap;
exports.deleteSnap = deleteSnap;
