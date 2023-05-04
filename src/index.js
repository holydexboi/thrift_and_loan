const express = require('express')
const cors = require('cors')
const config = require('config')
const member = require('../src/routes/member')
const saving = require('../src/routes/saving')
const dividend = require('../src/routes/dividend')
const auth = require('../src/routes/auth')
const loan = require('../src/routes/loan')
const transaction = require('../src/routes/transaction')
const knexConfig = require('../src/knexfile')


console.log(process.env.NODE_ENV)
if(!config.get('jwtPrivateKey')){
    console.log('FATAL ERROR - JWTPrivateKey not define')
    process.exit(1)
}
const app = express()

knexConfig
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/api/member', member)
app.use('/api/loan', loan)
app.use('/api/saving', saving)
app.use('/api/dividend', dividend)
app.use('/api/transaction', transaction)
app.use('/api/signin', auth)

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})