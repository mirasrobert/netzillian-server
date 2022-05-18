const { Schema, model } = require('mongoose')

const PasswordResetSchema = new Schema({
  email: {
    required: true,
    type: String,
    unique: true,
  },
  token: {
    required: true,
    type: String,
  },
  createdAt: {
    required: true,
    type: Date,
    default: Date.now,
  },
})

module.exports = List = model('PasswordReset', PasswordResetSchema)
