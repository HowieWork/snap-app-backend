const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { validationResult, sanitizeBody } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Snap = require('../models/snap');
const User = require('../models/user');
const mongooseUniqueValidator = require('mongoose-unique-validator');
const { CLIENT_RENEG_LIMIT } = require('tls');

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

  // NOTE GET CREATOR INFO FROM BACKEND INSTEAD OF FRONTEND
  // NOTE How do we have CREATOR from REQ.BODY here? CREATOR is assigned from FE by auth context *BETTER NOT GET THIS INFO FROM FRONT END DUE TO INVALID ID COULD BE PROVIDED
  const { title, description, address } = req.body;

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
    image: req.file.path,
    address,
    location: coordinates,
    // GET CREATOR FROM CHECK-AUTH MIDDLEWARE INSTEAD OF REQUEST BODY
    creator: req.userData.userId,
  });

  // CHECK WHETHER USER ID PROVIDED EXISTS
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating snap failed, please try again.', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  // console.log(user);

  // IF USER EXISTS:
  try {
    // A. SESSION & TRANSACTION
    const sess = await mongoose.startSession();
    // B. START TRANSACTION
    sess.startTransaction();
    // 1) SAVE NEW SNAP DOCUMENT
    await createdSnap.save({ session: sess });
    // 2) SAVE SNAP TO CORRESPONDING USER *PUSH is unique mongoose-only push, only add snap id.
    user.snaps.push(createdSnap);
    await user.save({ session: sess });
    // C. COMMIT TRANSACTION
    await sess.commitTransaction();
  } catch (err) {
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
  // ALTERNATIVE: let userWithSnaps;

  try {
    snaps = await Snap.find({ creator: userId });
    // ALTERNATIVE USING POPULATE: userWithSnaps = await User.findById(userId).populate('snaps');
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

const getRandomSnap = async (req, res, next) => {
  let snap;
  try {
    // NOTE RETURNED DOCUMENT IS PLAIN JAVASCRIPT OBJECTS, NOT MONGOOSE DOCUMENTS
    snap = await Snap.aggregate([{ $sample: { size: 1 } }]);
  } catch {
    const error = new HttpError(
      'Something went wrong, could not find a snap.',
      500
    );
    return next(error);
  }

  if (!snap) {
    return next(new HttpError('Could not find the snap.', 404));
  }

  console.log(snap[0]);

  res.status(200).json({ snap: snap[0] });
};

// 3) UPDATE
const updateSnap = async (req, res, next) => {
  // VALIDATING INPUTS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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

  // CHECK IF SNAP EXISTS
  if (!snap) {
    return next(new HttpError('Could not find the snap.', 404));
  }

  // AUTHORIZATION: VERIFY IF USER IS UPDATING HIS OWN SNAPS
  // snap.creator is ObjectId(...); needs to be converted to a string
  if (snap.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this snap.', 401);
    return next(error);
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
    // POPULATE CREATOR FOR ACCESS TO CREATOR.SNAPS
    snap = await Snap.findById(snapId).populate('creator');
  } catch {
    const error = new HttpError(
      'Something went wrong, could not delete snap',
      500
    );
    return next(error);
  }

  if (!snap) {
    return next(new HttpError('Could not find the snap for the id.', 404));
  }

  // AUTHORIZATION: CHECK IF SNAP IS CREATED BY CURRENT USER
  // DUE TO POPULATE CREATOR EARLIER, NEED TO SPECIFY ID PROPERTY
  if (snap.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this snap.',
      401
    );
    return next(error);
  }

  const imagePath = snap.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await snap.remove({ session: sess });
    snap.creator.snaps.pull(snap);
    await snap.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Something went wrong, could not delete snap',
      500
    );
    return next(error);
  }

  // DELETE IMAGE FILE
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: 'You have successfully deleted the snap.' });
};

exports.createSnap = createSnap;
exports.getSnapBySnapId = getSnapBySnapId;
exports.getSnapsByUserId = getSnapsByUserId;
exports.getRandomSnap = getRandomSnap;
exports.updateSnap = updateSnap;
exports.deleteSnap = deleteSnap;
