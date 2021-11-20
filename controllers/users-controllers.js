const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
    //ALTERNATIVE: const users = User.find({}, 'email name');
  } catch {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }

  res.status(200).json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const signUp = async (req, res, next) => {
  // VALIDATING INPUTS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Please input valid information.', 422));
  }
  // FIXME DESTRUCTURE MOTTO PROPERTY FROM REQ.BODY
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, plese login instead.',
      422
    );
    return next(error);
  }

  // TODO HASH PASSWORD BEFORE CREATING NEW USER

  // FIXME UPDATE MOTTO PROPERTY TO NEW USER DUCOMENT
  const newUser = new User({
    name,
    email,
    password,
    motto: 'DEFAULT MOTTO',
    image: req.file.path,
    snaps: [],
  });

  try {
    await newUser.save();
  } catch {
    const error = new HttpError('Signing up failed, please try again.', 500);
    return next(error);
  }

  // TODO GENERATE TOKEN FOR NEWLY SIGNED UP USER

  // TODO UPDATE RESPONSE
  // NOTE set getters to true will remove underscore _id --> id
  res.status(201).json({ user: newUser.toObject({ getters: true }) });
};

const logIn = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  // FIXME error message so weird
  try {
    existingUser = await User.findOne({ email: email });
  } catch {
    const error = new HttpError(
      'Logging in failed. Please try again later',
      500
    );
    return next(error);
  }

  // CHECK WHETHER USER EXISTS VIA EMAIL INPUT
  // FIXME DELETE PLAIN TEXT PASSWORD VALIDATION
  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  // TODO CHECK INPUT PASSWORD MATCHING WITH HASHED PASSWORD

  // TODO GENERATE TOKEN FOR LOGGED IN USER

  // TODO UPDATE RESPONSE
  res.status(200).json({
    message: 'Logged in!',
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
