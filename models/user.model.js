const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  country: { type: String },
  place: { type: String },
  dateOfBirth: { type: Date },
  residentAddress: { type: String },
  city: { type: String },
  balance: { type: Number, default: 0 },
  postalCode: { type: String },
  language: { type: String, default: 'English' },
  verificationCode: { type: String }, // 6-digit verification code
  verificationCodeExpires: { type: Date }, // Expiration time for the verification code
  is_verified: { type: Boolean, default: false }, // Account verification status
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);