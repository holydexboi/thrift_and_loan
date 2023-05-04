const express = require('express')
const Dividend = require('../models/dividend')
const { v4 } = require('uuid')
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router()

Dividend.createTable()

module.exports = router