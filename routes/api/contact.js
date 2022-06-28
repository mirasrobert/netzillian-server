const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const moment = require('moment-timezone')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const User = require('../../models/User')

// FOR USING GMAIL SMTP

/*
     As mentioned in the comments and directly quoted from google:

    `On May 30 2022, you may lose access to apps that are using less secure sign-in technology
      So the bottom code will probably stop working with Gmail. The solution is to enable 2-Step Verification 
      and generate Application password, then you can use the generated password to send emails using nodemailer.
      To do so you need to do the following:`

    1. Go to your google account at https://myaccount.google.com/
    2. Go to Security
    3. In "Signing in to Google" section choose 2-Step Verification - here you have to verify yourself, in my case it was with phone number and a confirmation code send as text message. After that you will be able to enabled 2-Step Verification
    4. Back to Security in "Signing in to Google" section choose App passwords
    5. From the Select app drop down choose Other (Custom name) and put a name e.g. nodemailer
    6. A modal dialog will appear with the password. Get that password and use it in your code.

    REFERENCE: https://stackoverflow.com/questions/45478293/username-and-password-not-accepted-when-using-nodemailer
*/

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

    // SMTP GMAIL
    let mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'gmail',
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'netzillia@gmail.com',
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    /*
    let mailTransporter = nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,         
      secure: false,
      auth: {
        user: 'MAILGUN-USER-HOST',
        pass: 'MAILGUN-SMTP-PASSWORD'
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
    */

    // Email
    // email pass = @netzillia29

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

    // Send Email to MYSELF
    mailTransporter.sendMail(details, (err) => {
      if (err) {
        return res.status(500).json({
          status: 'fail',
          message: 'Email has not been sent',
          err: process.env.NODE_ENV == 'production' ? null : err,
        })
      }

      console.log('Message sent: %s', details.subject)

      let outputForUSer = `
      <p>
       Thank you for contacting our company NETZILLIA. My team will check your concern. You are receiving this email because we haved received your email successfully. Thank you and sorry for inconvenience.
      </p>`

      let detailsForUser = {
        from: `Netzillia.com <netzillia@gmail.com>`,
        to: sender,
        subject: `Netzillia Contact Request`,
        text: 'Netzillia Contact Request',
        html: outputForUSer,
      }

      // Transporter Email bacck to user
      mailTransporterFeedback = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'gmail',
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'netzillia@gmail.com',
          pass: process.env.GOOGLE_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      // Send the email back to user
      mailTransporterFeedback.sendMail(detailsForUser, (err) => {
        if (err) {
          return res.status(500).json({
            status: 'fail',
            message: 'Email has not been sent',
            err: process.env.NODE_ENV == 'production' ? null : err,
          })
        }

        console.log('Message sent: %s', details.subject)

        // Send Email bacck to user
        mailTransporterFeedback = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          service: 'gmail',
          secure: false,
          auth: {
            user: process.env.EMAIL_USER || 'netzillia@gmail.com',
            pass: process.env.GOOGLE_APP_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        })

        // Send the email

        // If Email is Success
        return res.status(200).json({
          status: 'success',
          message: 'Email Sent',
        })
      })

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

    /*
     As mentioned in the comments and directly quoted from google:

    On May 30 2022, you may lose access to apps that are using less secure sign-in technology
      So the bottom code will probably stop working with Gmail. The solution is to enable 2-Step Verification and generate Application password, then you can use the generated password to send emails using nodemailer.To do so you need to do the following:

    1. Go to your google account at https://myaccount.google.com/
    2. Go to Security
    3. In "Signing in to Google" section choose 2-Step Verification - here you have to verify yourself, in my case it was with phone number and a confirmation code send as text message. After that you will be able to enabled 2-Step Verification
    4. Back to Security in "Signing in to Google" section choose App passwords
    5. From the Select app drop down choose Other (Custom name) and put a name e.g. nodemailer
    6. A modal dialog will appear with the password. Get that password and use it in your code.
    */

    let mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'gmail',
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'netzillia@gmail.com',
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    /*
    let mailTransporter = nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,         
      secure: false,
      auth: {
        user: 'MAILGUN-USER-HOST',
        pass: 'MAILGUN-SMTP-PASSWORD'
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
    */

    const output = `<p>
		Dear ${user.name},
		</p>
    <br>
    <p>This message is to confirm that your plan purchase has been successful. The details of the  purchase are below:</p>
    <p>
      Registration Date: ${moment
        .tz(req.body.date, 'Asia/Manila')
        .format('LLLL')}
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
          err: process.env.NODE_ENV == 'production' ? null : err,
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
