const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const moment = require('moment')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const User = require('../../models/User')

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('sender', 'Sender email is required').not().isEmpty(),
    check('subject', 'Subject email is required').not().isEmpty(),
    check('sender', 'Sender email is not valid').isEmail(),
    check('message', 'Message is required').not().isEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, subject, sender, message } = req.body

    let mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'gmail',
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'netzillia@gmail.com',
        pass: process.env.EMAIL_PASS || '@netzillia29',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    const output = `<p>
		Dear NetZillia,
  		<br>
		Hi, I am <strong>${name} <${sender}></strong>. ${message}
		</p>`

    let details = {
      from: `${name} <${sender}>`,
      to: process.env.EMAIL_USER || 'netzillia@gmail.com',
      subject: `${subject} - ${sender}`,
      text: 'Netzillia Contact Request',
      html: output,
    }

    mailTransporter.sendMail(details, (err) => {
      if (err) {
        return res.status(500).json({
          status: 'fail',
          message: 'Email has not been sent',
        })
      }

      console.log('Message sent: %s', details.subject)

      // If Email is Success
      return res.status(200).json({
        status: 'success',
        message: 'Email Sent',
      })
    })
  }
)

// Send an Invoice Mail
router.post(
  '/invoice',
  [
    auth,
    [
      check('plan', 'Plan  is required').not().isEmpty(),
      check('transactionId', 'Transaction # is required').not().isEmpty(),
      check('amount', 'Amount is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        errors: { msg: 'User not found' },
      })
    }

    let mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'gmail',
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'netzillia@gmail.com',
        pass: process.env.EMAIL_PASS || '@netzillia29',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    const output = `<p>
		Dear ${user.name},
		</p>
    <br>
    <p>This message is to confirm that your plan purchase has been successful. The details of the  purchase are below:</p>
    <p>
      Registration Date: ${moment(req.body.date).format('LLLL')}
    </p>
    <p>
      Plan: ${req.body.plan}
    </p>
    <p>
      Amount: ${req.body.amount}
    </p>
    <p>
      Transaction #: ${req.body.transactionId}
    </p>
    <br>
    <p>Note: This email will serve as an official receipt for this payment.</p>
    <br>
    <br>
    <p>Copyright © Netzillia | DETA 2022, All rights reserved.</p>
    <p>${process.env.CLIENT_WEBSITE_URL || ''}</p>
    `

    let details = {
      from: `Netzillia.com <netzillia@gmail.com>`,
      to: user.email,
      subject: `Invoice Payment Confirmation`,
      text: 'Netzillia Invoice',
      html: output,
    }

    mailTransporter.sendMail(details, (err) => {
      if (err) {
        console.log(err)

        return res.status(500).json({
          status: 'fail',
          message: 'Email has not been sent',
        })
      }

      console.log('Message sent: %s', details.subject)

      // If Email is Success
      return res.status(200).json({
        status: 'success',
        message: 'Email Sent',
      })
    })
  }
)

module.exports = router
