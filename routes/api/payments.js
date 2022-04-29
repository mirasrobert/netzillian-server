const express = require('express')
const router = express.Router()

const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Payment = require('../../models/Payment')
const User = require('../../models/User')

// Add a payment history
router.post(
  '/',
  [
    auth,
    [
      check('paymentMethod', 'Payment method is required').not().isEmpty(),
      check('transactionId', 'Transaction ID is required').not().isEmpty(),
      check('amount', 'Amount is required').not().isEmpty(),
      check('currency', 'Currency is required').not().isEmpty(),
      check('plan', 'Plan is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { paymentMethod, transactionId, amount, currency, plan } = req.body

      // Create and save the payment
      const newPayment = new Payment({
        user: req.user.id,
        paymentMethod,
        transactionId,
        amount,
        currency,
        plan,
      })

      const payment = await newPayment.save()

      res.json(payment)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
    }
  }
)

// Get user's payments
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })

    res.json(payments)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// Update user's plan
router.put('/plan', auth, async (req, res) => {
  try {
    const { plan } = req.body

    const user = await User.findById(req.user.id)

    user.plan = plan

    await user.save()

    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
