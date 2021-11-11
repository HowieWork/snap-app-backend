const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

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

const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

const signUp = (req, res, next) => {
  // VALIDATING INPUTS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Please input valid information.', 422));
  }

  const { name, motto, email, password, image } = req.body;

  const hasUser = DUMMY_USERS.find((user) => user.email === email);
  if (hasUser) {
    return next(
      new HttpError('An account associted with this email already exists.', 422)
    );
  }

  const newUser = {
    id: uuidv4(),
    name,
    motto,
    email,
    password,
    image,
    snapCount: 0,
  };
  DUMMY_USERS.push(newUser);
  res.status(201).json({ user: newUser });
};

const logIn = (req, res, next) => {
  const { email, password } = req.body;
  const user = DUMMY_USERS.find((user) => user.email === email);

  if (!user) {
    return next(new HttpError('Could not find the user.', 404));
  }
  // FIXME password.trim()
  if (password !== user.password) {
    return next(new HttpError('Please enter the correct password.', 401));
  }

  res.status(200).json({ user });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
