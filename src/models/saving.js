const knex = require("../knexfile");
const knexFn = require('knex')
const { v4 } = require('uuid')


async function createTable() {
  try {
    await knex.schema.hasTable("savings").then(function (exists) {
      
      if (!exists) {
        async function create() {
          await knex.schema
            .withSchema("thrift_project")
            .createTable("savings", function (table) {
              table.string("id").primary();
              table.string('member_id')
              table.foreign('member_id').references('id').inTable('members')
              table.float("balance");
              table.enu("frequency", ["monthly", "bi-weekly", "annually", "quaterly"]);
              table.enu("status", ["active", "closed"]);
              table.timestamp("created_at", { precision: 6 }).defaultTo(knex.fn.now(6))
            });
        }
        create()
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function getSavingsBalance(savingsId) {
    
    const output = await knex('savings')
        .where({ id: savingsId })
        .select('balance')
    
    if (!output[0]) throw new Error('Account does not exist')

    
    return output[0].balance
}

async function add(saving) {
    console.log(saving)
    const output = await knex('savings')
        .where({ member_id: saving.member_id })
        .select('member_id')
    
    if (output[0]) throw new Error('User already has an account')

    const transactionId = v4();
    try {
        
        await knex.transaction(async trx => {
    
            await trx('savings').insert(saving);
            
            await trx('transactions').insert({id: transactionId, savings_id: saving.id, amount: 0.00, balance: 0.00, transaction_code: 0.00, payment_type: 'deposit', status: 'confirmed'})
                
        })

        return saving

    }
    catch (error) {
        throw new Error(error)
    }

    
}

async function getMyContribution(member_id) {
  
    const output = await knex('savings')
        .where({ member_id: member_id})
        .select('id','balance', 'frequency', 'status')
    
    if (!output[0]) throw new Error('You have no active contribution')
  
    return output
  }

async function deposit(savingsId, amount) {

    const output = await knex('savings')
        .where({ id: savingsId })
        .select('id')
    
    if (!output[0]) throw new Error('The savings account does not exist')

    const saving = await knex('savings')
        .where('id', '=', savingsId)
        .increment({
            balance: amount
        })

    return saving
}

async function withdraw(memberId, savingId, amount) {

    const output = await knex('savings')
        .where({ id: savingId, member_id: memberId, balance: amount })
        .select('id')
    
    if (!output[0]) throw new Error('No contribution with the given ID')

    const acctBalance = await knex('savings')
        .where({
            id: savingId
        }).select('balance')
    
    
    if(acctBalance[0].balance < amount) throw new Error('Insufficient balance')
    
    const saving = await knex('savings')
        .where('id', '=', savingId)
        .decrement({
            balance: amount
        })
    
    return saving
}

async function transfer(userId, receiverId, amount) {

    const output = await db('account')
        .where({ user: userId })
        .select('accountId')
    
    if (!output[0]) throw new Error('This user does not have an account and cannot transfer')

    const receiver = await db('account')
        .where({ accountId: receiverId })
        .select('accountId')
    
    if (!receiver[0]) throw new Error('This user with this account number does not exist')

    const acctBalance = await db('account')
        .where({
            user: userId
        }).select('balance')

    if (acctBalance[0].balance < amount) throw new Error('Insufficient balance')
    
    try {
        
        await db.transaction(async trx => {
    
            await trx('account')
                .where('user', '=', userId)
                .decrement({
                    balance: amount
                })
            
            await trx('account')
                .where('accountId', '=', receiverId)
                .increment({
                    balance: amount
                })
                
        })

    }
    catch (error) {
        console.log(error.message)
    }
}

module.exports = { createTable, add, getSavingsBalance, getMyContribution, deposit, withdraw, transfer};