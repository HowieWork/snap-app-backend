const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

// 1. GET USERS
const getUsers = async (req, res, next) => {
  let users;
  try {
    // NOTE EXCLUDE PASSWORD THROUGH PROJECTION
    // PROJECTIN MEANS SELECTING ONLY THE NECESSARY DATA RATHER THAN SELECTING WHOLE OF THE DATA OF A DOCUMENT
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

// 2. SIGN UP USER
const signUp = async (req, res, next) => {
  // NOTE VALIDATING INPUTS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Please input valid information.', 422));
  }

  // NOTE GET INPUTS FROM REQUEST BODY
  const { name, email, password, motto } = req.body;

  // NOTE CHECK IF USER ALREADY EXISTS VIA EMAIL
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

  // NOTE HASH PASSWORD BEFORE CREATING NEW USER
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again.',
      500
    );
    return next(error);
  }

  // FIXME UPDATE MOTTO PROPERTY TO NEW USER DUCOMENT
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    motto,
    image: req.file.path,
    snaps: [],
  });

  try {
    await newUser.save();
  } catch {
    const error = new HttpError('Signing up failed, please try again.', 500);
    return next(error);
  }

  // NOTE GENERATE TOKEN FOR NEWLY SIGNED UP USER
  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again.', 500);
    return next(error);
  }

  // NOTE SEND RESPONSE
  // OUTDATED TIP: set getters to true will remove underscore _id --> id
  res
    .status(201)
    .json({ userId: newUser.id, email: newUser.email, token: token });
};

// 3. LOG IN USER
const logIn = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  // NOTE CHECK EMAIL INPUT: WHETHER USER EXISTS
  try {
    existingUser = await User.findOne({ email: email });
  } catch {
    const error = new HttpError(
      'Logging in failed. Please try again later',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  // NOTE CHECK PASSWORD INPUT: WHETHER MATCHING WITH STORED HASHED PASSWORD
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in. Please check your credentials and try again.',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  // NOTE GENERATE TOKEN FOR LOGGED IN USER
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again.', 500);
    return next(error);
  }

  // NOTE SEND RESPONSE
  res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    token,
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
