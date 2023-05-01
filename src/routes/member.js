const express = require('express')
const Member = require('../models/member')
const bcrypt = require('bcrypt')
const {v4} = require('uuid')
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin');

const router = express.Router()

Member.createTable()

router.post('/register', async (req, res) => {

    if (!req.body.firstname) return res.status(400).send('Firstname is not define')
    if (!req.body.lastname) return res.status(400).send('Lastname is not define')
    if (!req.body.gender) return res.status(400).send('Gender is not define')
    if (!req.body.state) return res.status(400).send('State is not define')
    if (!req.body.lga) return res.status(400).send('Local Goverment Area is not define')
    if (!req.body.dob) return res.status(400).send('Date of Birth is not define')
    if (!req.body.email) return res.status(400).send('Email not define')
    if (!req.body.password) return res.status(400).send('Password not define')
    if(!req.body.savingsType) return res.status(400).send('Savings type not define')
    
    
    const userId = v4()
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt)
    const email = req.body.email
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const gender = req.body.gender
    const state = req.body.state
    const lga = req.body.lga
    const dob = req.body.dob
    const has_loan = false
    const status = 'pending'
    const isAdmin = false
    const contribution_type = req.body.savingsType


    Member.add({id: userId, email, password, firstname, lastname, gender, state, lga, dob, has_loan, status, isAdmin, contribution_type})
        .then(user => {
            const token = jwt.sign({ _id: userId, isAdmin: isAdmin}, config.get('jwtPrivateKey'));
            res.header('x-auth-token', token)
            .header("access-control-expose-headers", "x-auth-token")
            .send({token, userId, email, firstname, lastname, gender, state, dob, lga, has_loan, status, isAdmin, contribution_type});
        })
        .catch(error => {
        res.status(400).send(error.message)
    })

    
    
})

router.put('/approve/:id', [auth, admin], async (req, res) => {

    if (!req.body.status) return res.status(400).send('Please enter status')

    Member.approve(req.body.status, req.params.id)
        .then(user => {
            res.send(user);
        })
        .catch(error => {
        res.status(400).send(error.message)
    })

    
    
})

router.get('/userprofile', auth, async (req, res) => {

    Member.getUser(req.member._id)
    .then(user => {
        res.send(user)
    })
    .catch(error => {
        res.status(400).send(error.message)
    })
})

router.put('/update', auth, async (req, res) => {

    const salt = await bcrypt.genSalt(10);
    const password = req.body.password ? await bcrypt.hash(req.body.password, salt) : ''
    const firstname = req.body.firstname ? req.body.firstname : '' 
    const lastname = req.body.lastname ? req.body.lastname : '' 



    Member.changeProfile({ password, firstname, lastname}, req.member._id)
        .then(user => {
            const token = jwt.sign({ _id: req.member._id }, config.get('jwtPrivateKey'));
            res.header('x-auth-token', token).send({userId: req.member._Id, firstname, lastname});
        })
        .catch(error => {
        res.status(500).send(error.message)
    })

    
    
})

module.exports = router

