const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const { check, validationResult } = require('express-validator')

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

module.exports = router
