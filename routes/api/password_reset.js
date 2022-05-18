const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')

const PasswordReset = require('../../models/PasswordReset')

const makeToken = require('../../helper/helper')

router.post('/', async (req, res) => {
  const token = makeToken(30)

  const { email } = req.body

  const user = await User.findOne({
    email: email,
  })

  // If user not found
  if (!user) {
    return res.status(400).json({
      msg: 'User not found',
    })
  }

  // Delete any existing reset tokens
  const deleteExistingToken = await PasswordReset.deleteOne({ email: email })

  if (deleteExistingToken.deletedCount > 0) {
    console.log('Deleted existing token')
  }

  // Create new reset token
  await PasswordReset.create({
    email,
    token: await bcrypt.hash(token, await bcrypt.genSalt(10)),
    createdAt: Date.now() + 1000 * 60 * 60,
  })

  // Generate a url
  const url = `${process.env.CLIENT_WEBSITE_URL}/reset/${token}/email/${email}`

  // Send an email
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
  		You are receiving this email because we received a password reset request for your account.
		  This password reset link will expire in 60 minutes.
		  If you did not request a password reset, no further action is required.
	  </p>
	  <p>
  		Click on the following link, or paste this into your browser to complete your password reset:		
		  <a href="${url}">${url}</a>
	  </p>
  		<p>
		  Regards,
      <br>
		  Netzillia Team
		  </p>
	  `

  let details = {
    from: `Netzillia.com <netzillia@gmail.com>`,
    to: email || 'netzillia@gmail.com',
    subject: `Reset Password Notification`,
    text: 'Netzillia Password Reset',
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
      message: 'A password reset has been sent to your email',
    })
  })
})

router.post('/reset', async (req, res) => {
  try {
    const { email, token, password } = req.body

    // Get password reset by token
    const passwordReset = await PasswordReset.findOne({
      email: email,
    })

    // check if user has reset password request
    if (!passwordReset) {
      return res.status(400).json({
        status: 'fail',
        message: 'No User Found',
      })
    }

    // Check if Token is Invalid Or Not
    const isMatch = await bcrypt.compare(token, passwordReset.token)
    if (!isMatch) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Your password reset request is expired. Please resubmit your request',
      })
    }

    const user = await User.findOne({
      email: passwordReset.email,
    })

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'No User Found',
      })
    }

    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10))

    await user.save()

    // Delete the token
    await PasswordReset.deleteOne({ email: email })

    return res.status(200).json({
      status: 'success',
      message: 'Password Changed',
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
