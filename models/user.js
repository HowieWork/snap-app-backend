const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  // unique: define a unique INDEX on this property. *fast query for large user base
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  motto: { type: String, required: true },
  image: { type: String, required: true },
  snaps: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Snap' }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
