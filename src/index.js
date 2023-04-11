const express = require('express')
// const cors = require('cors')
const member = require('../src/routes/member')
const saving = require('../src/routes/saving')
const auth = require('../src/routes/auth')
const loan = require('../src/routes/loan')
const transaction = require('../src/routes/transaction')
const knexConfig = require('../src/knexfile')

const app = express()

knexConfig
app.use(express.json());
// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/api/member', member)
app.use('/api/loan', loan)
app.use('/api/saving', saving)
app.use('/api/transaction', transaction)
app.use('/api/signin', auth)

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})