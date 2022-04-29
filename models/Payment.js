const { Schema, model } = require('mongoose')

const PaymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Payment = model('payment', PaymentSchema)
