const express = require('express')
const Saving = require('../models/saving')
const Transaction = require('../models/transaction')
const { v4 } = require('uuid')
const auth = require('../middleware/auth');

const router = express.Router()

Saving.createTable()



router.post('/create', auth, async (req, res) => {

    const accountId = v4();

    Account.add({accountId, user: req.user._id, balance: req.body.amount})
        .then(account => {
        res.status(200).send(account)
        })
        .catch(error => {
        res.status(500).send(error.message)
        })
    
})

router.post('/approve/:id', auth, async (req, res) => {

    const transactionId = v4();
    if (!req.body.status) return res.status(400).send('Please enter amount to deposit')
    
    Saving.approve(req.params.id, req.body.status)
        .then(account => {
            console.log(account)
            res.status(200).send('Account has been updated successfully')
            Transaction.create({id: transactionId, savings_id: req.params.id, amount: 0.00, balance: 0.00, transaction_code: 0.00, payment_type: 'deposit', status: 'confirmed'})
        })
        .catch(error => {
            res.status(500).send(error.message)
            
        })
    
})

router.post('/deposit', auth, async (req, res) => {


    if (!req.body.amount) return res.status(400).send('Please enter amount to deposit')
    
    Account.deposit(req.user._id, req.body.amount)
        .then(account => {
            res.status(200).send('Your account has been credited successfully')
        })
        .catch(error => {
            res.status(500).send(error.message)
            
        })  
    
})


router.post('/withdraw', auth, async (req, res) => {

    if (!req.body.amount) return res.status(400).send('Please enter amount to withdraw')

    Account.withdraw(req.user._id, req.body.amount)
        .then(account => {
            res.status(200).send('Your account has been debited successfully')        
        })
        .catch(error => {
            res.status(500).send(error.message)
        })
})

router.post('/transfer', auth, async (req, res) => {

    if (!req.body.amount) return res.status(400).send('Please enter amount to transfer')

    if (!req.body.accountId) return res.status(400).send('Please enter accountId to transfer to')

    Account.transfer(req.user._id, req.body.accountId, req.body.amount)
        .then(account => {
            res.status(200).send('You have successfully transfered the funds')
        })
        .catch(error => {
            res.status(500).send(error.message)
        })
})

module.exports = router

module.exports = router