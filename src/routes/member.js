const express = require('express')
const Member = require('../models/member')
const bcrypt = require('bcrypt')
const {v4} = require('uuid')
const jwt = require('jsonwebtoken');
const config = require('config')

const router = express.Router()

Member.createTable()

router.post('/register', async (req, res) => {

    if (!req.body.firstname) return res.status(400).send('Firstname is not define')
    if (!req.body.lastname) return res.status(400).send('Lastname is not define')
    if (!req.body.gender) return res.status(400).send('Gender is not define')
    if (!req.body.nationality) return res.status(400).send('Nationality is not define')
    if (!req.body.state) return res.status(400).send('State is not define')
    if (!req.body.lga) return res.status(400).send('Local Goverment Area is not define')
    if (!req.body.dob) return res.status(400).send('Date of Birth is not define')
    if (!req.body.email) return res.status(400).send('email not define')
    if (!req.body.password) return res.status(400).send('password not define')
    if (!req.body.savingsType) return res.status(400).send('Savings Type not define')
    
    const userId = v4()
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt)
    const email = req.body.email
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const gender = req.body.gender
    const nationality = req.body.nationality
    const state = req.body.state
    const lga = req.body.lga
    const dob = req.body.dob
    const savingsType = req.body.savingsType


    Member.add({id: userId, email, password, firstname, lastname, gender, nationality, state, lga, dob}, savingsType)
        .then(user => {
            const token = jwt.sign({ _id: userId }, config.get('jwtPrivateKey'));
            res.header('x-auth-token', token).send({userId, email, firstname, lastname, gender, nationality, state, dob});
        })
        .catch(error => {
        res.status(500).send(error.message)
    })
    
})

module.exports = router

