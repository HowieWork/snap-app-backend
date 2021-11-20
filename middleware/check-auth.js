const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  // NOTE ENSURE OPTIONS REQUESTS ARE NOT BLOCKED. OPTIONS REQUEST ARE BROWSER BEHAVIOR BEFORE SENDING POST/UPDATE/DELETE REQUESTS.
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    // NOTE TWO ERROR SCENARIOS: 1) AUTHORIZATION IS NOT SET DUE TO NON-PROTECTED ROUTES, SPLIT() WILL CRASH; 2) TOKEN DOES NOT EXIST
    // e.g. Authorization: 'Bearer TOKEN' *CONVENTION
    const token = req.headers.authorization.split(' ')[1];
    // 1. CHECK WHETHER TOKEN EXISTS
    if (!token) {
      // THROW NEW ERROR DOES NOT MATTER HERE, SINCE NEW HTTPERROR WILL BE CREATED IN CATCH BLOCK
      throw new Error('Authentication failed!');
    }
    // 2. DECODE TOKEN
    const decodedToken = jwt.verify(token, 'do_not_share_this_secret');
    // 3. ADD DECODED TOKEN TO REQUEST OBJECT
    // WILL BE USEFUL TO IDENTIFY WHETHER THE SAME USER FOR FOLLOWING POST / DELETE REQUESTS
    req.userData = { userId: decodedToken.userId };

    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 403);
    return next(error);
  }
};
