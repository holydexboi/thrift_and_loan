const express = require('express')
const Loan = require('../models/loan')

const router = express.Router()

Loan.createTable()

module.exports = router