const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

let DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Sam Skylar',
    motto: 'I love living in the city!',
    email: 'sam@email.com',
    password: 'samlovessnap',
    image:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80',
    snapCount: 3,
  },
  {
    id: 'u2',
    name: 'Sam Skylar',
    motto: 'I love living in the city! I love living in the city! I love!',
    email: 'sam@email.com',
    password: 'samlovessnap',
    image:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80',
    snapCount: 3,
  },
  {
    id: 'u3',
    name: 'Sam Skylar',
    motto: 'I love living in the city!',
    email: 'sam@email.com',
    password: 'samlovessnap',
    image:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80',
    snapCount: 3,
  },
  {
    id: 'u4',
    name: 'Sam Skylar',
    motto: 'I love living in the city!',
    email: 'sam@email.com',
    password: 'samlovessnap',
    image:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80',
    snapCount: 3,
  },
];

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

  const { name, motto, email, password, image } = req.body;

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

  const newUser = new User({
    name,
    email,
    password,
    motto,
    image,
    snaps: [],
  });

  try {
    await newUser.save();
  } catch {
    const error = new HttpError('Signing up failed, please try again.', 500);
    return next(error);
  }
  // set getters to true will remove underscore _id --> id
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

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  res.status(200).json({ message: 'Logged in!' });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
