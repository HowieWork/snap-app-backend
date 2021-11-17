const express = require('express');
const mongoose = require('mongoose');

const snapsRoutes = require('./routes/snaps-routes');
const usersRoutes = require('./routes/users-routes');

// 1. CREATE AN EXPRESS APPLICATION
const app = express();

// 2. MIDDLEWARES
// 1) PARSE REQUEST BODY
app.use(express.json());

// 2) CORS ERROR HANDLING
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST,PATCH,DELETE');
  next();
});

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

// 3. CONNECT TO DATABASE
mongoose
  .connect(
    'mongodb+srv://howie:***REMOVED***@cluster0.jlpms.mongodb.net/snap?retryWrites=true&w=majority'
  )
  .then(
    // LISTEN TO PORT
    app.listen(8000, () => {
      console.log('Server has been running successfully on port 8000.');
    })
  )
  .catch((error) => console.log(error));
