const express = require('express')
const Saving = require('../models/saving')
const Transaction = require('../models/transaction')
const { v4 } = require('uuid')
const auth = require('../middleware/auth');

const router = express.Router()

Saving.createTable()
Saving.add()


// router.put('/approve/:id', auth, async (req, res) => {

//     const transactionId = v4();
//     if (!req.body.status) return res.status(400).send('Please enter amount to deposit')
    
//     Saving.approve(req.params.id, req.body.status)
//         .then(account => {
//             console.log(account)
//             res.status(200).send('Account has been updated successfully')
//             Transaction.create({id: transactionId, savings_id: req.params.id, amount: 0.00, balance: 0.00, transaction_code: 0.00, payment_type: 'deposit', status: 'confirmed'})
//         })
//         .catch(error => {
//             res.status(500).send(error.message)
            
//         })
    
// })

router.get('/contribution/type', async (req, res) => {
console.log('ki')
    Saving.getContributionType()
    .then(contri => {
        res.send(contri)
    })
    .catch(err => {
        res.status(500).send(err.message)
    })
})

router.get('/mycontribution', auth, async (req, res) => {

    Saving.getMyContribution(req.member._id)
    .then(contr => {
        res.status(200).send(contr)
    })
    .catch(error => {
        res.status(500).send(error.message)
        
    })
      
    
})



// router.post('/deposit/:id', auth, async (req, res) => {


//     if (!req.body.amount) return res.status(400).send('Please enter amount to deposit');
    
//     Saving.deposit(req.params.id, req.body.amount)
//         .then(account => {
//             res.status(200).send('Your account has been credited successfully');
//         })
//         .catch(error => {
//             res.status(500).send(error.message)
            
//         })  
    
// })


// router.post('/withdraw/:id', auth, async (req, res) => {

//     if (!req.body.amount) return res.status(400).send('Please enter amount to withdraw')

//     Saving.withdraw(req.member._id, req.params.id, req.body.amount)
//         .then(account => {
//             res.status(200).send('Your account has been debited successfully')        
//         })
//         .catch(error => {
//             res.status(500).send(error.message)
//         })
// })

module.exports = router