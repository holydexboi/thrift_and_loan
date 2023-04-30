const express = require('express')
const Transaction = require('../models/transaction')
const Saving = require('../models/saving')
const { v4 } = require('uuid')
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router()

Transaction.createTable()

router.post('/deposit', auth, async (req, res) => {

    const transactionId = v4();

    if (!req.body.amount) return res.status(400).send('Please enter amount')
    if (!req.body.savingsId) return res.status(400).send('Please enter savings Id')
    if (!req.body.transactionCode) return res.status(400).send('Please enter transaction code or tell number')
    if (!req.body.paymentType) return res.status(400).send('Please enter payment type')
    Saving.getSavingsBalance(req.body.savingsId).then(saving => {
        Transaction.create({id: transactionId, amount: req.body.amount, savings_id: req.body.savingsId, balance: saving+req.body.amount, transaction_code: req.body.transactionCode, payment_type: req.body.paymentType, status: 'pending'})
        .then(transaction => {
            res.status(200).send('Your transaction has been initiated')
        })
        .catch(error => {
            res.status(500).send(error.message)
            
        })
    })
    .catch(error => {
        res.status(500).send(error.message)
        
    }) 
      
    
})


router.post('/withdraw', auth, async (req, res) => {

    const transactionId = v4();

    if (!req.body.amount) return res.status(400).send('Please enter amount')
    if (!req.body.savingsId) return res.status(400).send('Please enter savings Id')
    if (!req.body.beneficiaryAccount) return res.status(400).send('Please enter transaction code or teller number')
    Saving.getSavingsBalance(req.body.savingsId).then(saving => {
        Transaction.create({id: transactionId, amount: req.body.amount, savings_id: req.body.savingsId, balance: saving-req.body.amount, transaction_code: req.body.beneficiaryAccount, payment_type: "withdraw", status: 'pending'})
        .then(transaction => {
            res.status(200).send('Your withdraw has been initiated')
        })
        .catch(error => {
            res.status(500).send(error.message)
            
        })
    })
    .catch(error => {
        res.status(500).send(error.message)
        
    }) 
      
    
})

router.put('/update/deposit/:id', [auth, admin], async (req, res) => {


    if (!req.body.status) return res.status(400).send('Please enter status')
    
   
        Transaction.approve(req.params.id , req.body.status)
        .then(transaction => {
            Saving.deposit(transaction.savings_id, transaction.amount)
            res.status(200).send('Your transaction has been updated')
        })
        .catch(error => {
            res.status(500).send(error.message)
            
        })

    .catch(error => {
        res.status(500).send(error.message)
        
    }) 
      
    
})

router.put('/update/withdraw/:id', [auth, admin], async (req, res) => {


    if (!req.body.status) return res.status(400).send('Please enter status')
    
   
        Transaction.approve(req.params.id , req.body.status)
        .then(transaction => {
            Saving.withdraw(req.member._id, transaction.savings_id, transaction.amount)
            res.status(200).send('Your transaction has been updated')
        })
        .catch(error => {
            res.status(500).send(error.message)
            
        })

    .catch(error => {
        res.status(500).send(error.message)
        
    }) 
      
    
})

router.get('/contransact/:id', auth, async (req, res) => {

    Transaction.getContributionTransact(req.params.id)
    .then(contr => {
        res.status(200).send(contr)
    })
    .catch(error => {
        res.status(500).send(error.message)
        
    })
      
    
})

module.exports = router