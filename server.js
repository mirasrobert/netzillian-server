const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

/*
var corsOptions = {
  origin: process.env.CLIENT_WEBSITE_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
*/
app.use(cors())

// Connect database
;(async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    console.log('MongoDB Connected...')
  } catch (err) {
    console.error(err.message)
    // Exit process with failure
    process.exit(1)
  }
})()

// Init middleware
app.use(express.json({ extended: false }))

app.get('/', (req, res) => {
  res.json({
    msg: 'Welcome to the netzillia.com',
    website: 'https://netzillia.com/',
  })
})

// Define routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/boards', require('./routes/api/boards'))
app.use('/api/lists', require('./routes/api/lists'))
app.use('/api/cards', require('./routes/api/cards'))
app.use('/api/checklists', require('./routes/api/checklists'))
app.use('/api/payments', require('./routes/api/payments'))
app.use('/api/contacts', require('./routes/api/contact'))
app.use('/api/transactions', require('./routes/api/transactions'))

app.get('/api/config/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID)
})

// DEPLOY YOUR CLIENT AND BACKEND IN A SEPERATE WEBSITE

/*
// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}
*/

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('Server started on port ' + PORT))
