// COMMON JS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Node js doesn't support ES6 MODULE directly
// import { Schema } from 'mongoose';

const snapSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  creator: { type: String, required: true },
});

module.exports = mongoose.model('Snap', snapSchema);
