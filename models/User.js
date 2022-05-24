const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  avatar: {
    type: String,
  },
  providerId: {
    type: String,
    required: false,
    default: null,
  },
  boards: [
    {
      type: Schema.Types.ObjectId,
      ref: 'boards',
    },
  ],
  plan: {
    type: String,
    default: 'free',
    required: true,
  },
})

module.exports = User = model('user', UserSchema)
