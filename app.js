const express = require('express');
const mongoose = require('mongoose');

const snapsRoutes = require('./routes/snaps-routes');
const usersRoutes = require('./routes/users-routes');

// CREATE AN EXPRESS APPLICATION
const app = express();

// MIDDLEWARES
// 1) PARSE REQUEST BODY
app.use(express.json());

// 2) ROUTES MIDDLEWARE
app.use('/api/snaps', snapsRoutes);
app.use('/api/users', usersRoutes);

// 3) ERROR MIDDLEWARE
app.use((error, req, res, next) => {
  // Check if response has been sent, we won't send a response on our own
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || 'An unknown error occurred!' });
});

// CONNECT TO DATABASE
mongoose
  .connect(
    'mongodb+srv://howie:***REMOVED***@cluster0.jlpms.mongodb.net/snaps?retryWrites=true&w=majority'
  )
  .then(
    // LISTEN TO PORT
    app.listen(8000, () => {
      console.log('Server has been running successfully on port 8000.');
    })
  )
  .catch((error) => console.log(error));
