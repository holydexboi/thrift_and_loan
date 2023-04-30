const express = require('express')
const moment = require('moment')
const Loan = require('../models/loan')
const { v4 } = require('uuid')
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router()

Loan.createTable()

router.post('/apply', auth, async (req, res) => {

    const loanId = v4();

    if (!req.body.amount) return res.status(400).send('Please enter amount')
    if (!req.body.term) return res.status(400).send('Please enter term in month')
    if (!req.body.collateral) return res.status(400).send('Please enter collateral item')
    const rate  = 0.001
    const interest = parseFloat(req.body.amount) * rate * parseInt(req.body.term)
    const start_date = moment().format()
    const end_date = moment().add(req.body.term, 'months').format(); 
    Loan.applyLoan({id: loanId, member_id: req.member._id,amount: parseFloat(req.body.amount), loan_balance: parseFloat(req.body.amount), interest, rate, term: parseInt(req.body.term), start_date, end_date, repayment_amount: parseFloat(req.body.amount) + interest, collateral: req.body.collateral, repayment_balance: 0.00,status: 'pending'})
    .then(loan => {
        res.status(200).send('Your loan request has been initiated')
    })
    .catch(error => {
        res.status(500).send(error.message)
        
    })
      
    
})

router.put('/approve/:id', [auth, admin], async (req, res) => {

    if(!req.body.status) return res.status(400).send('Please enter the status')

    Loan.approveLoan(req.param.id,req.body.status)
    .then(loan => {
        res.status(200).send('You have successfully update this loan')
    })
    .catch(error => {
        res.status(500).send(error.message)
    })
})

router.get('/myloan', auth, async (req, res) => {

    Loan.getMyLoan(req.member._id)
    .then(loan => {
        res.status(200).send(loan)
    })
    .catch(error => {
        res.status(500).send(error.message)
        
    })
      
    
})

module.exports = router