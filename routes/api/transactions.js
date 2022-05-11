const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')

const Payment = require('../../models/Payment')

router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })

    res.json(payments)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
