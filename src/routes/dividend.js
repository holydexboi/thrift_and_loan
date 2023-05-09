const express = require('express')
const Dividend = require('../models/dividend')
const { v4 } = require('uuid')
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router()

Dividend.createTable()

router.get('/alldividend', (req, res) => {

    Dividend.getAllDividend()
    .then(dividend => {
        res.send(dividend)
    }).catch(error => {
        res.status(400).send(error.message)
    })
})

module.exports = router