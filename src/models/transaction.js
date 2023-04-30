const knex = require("../knexfile");



async function createTable() {
  try {
    await knex.schema.hasTable("transactions").then(function (exists) {
      
      if (!exists) {
        async function create() {
          await knex.schema
            .withSchema("thrift_project")
            .createTable("transactions", function (table) {
              table.string("id").primary();
              table.string('savings_id')
              table.foreign('savings_id').references('id').inTable('savings')
              table.float("amount");
              table.float("balance");
              table.integer("transaction_code");
              table.enu("payment_type", ["deposit", "transfer", "cheque", "withdraw"]);
              table.enu("status", ["confirmed", "rejected", "pending"]);
              table.datetime("date", { precision: 6 }).defaultTo(knex.fn.now(6))
            });
        }
        create()
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function create(transaction) {
    console.log(transaction)
    const id = await knex('transactions').insert(transaction);

    return id
}

async function getContributionTransact(savings_id) {
  
  const output = await knex('transactions')
      .where({ savings_id: savings_id})
      .select('amount', 'balance', 'transaction_code', 'payment_type', 'status', 'date')
  
  if (!output[0]) throw new Error('You have no transaction attach to this contribution')

  return output
}

async function approve(transactionId, status) {

    const output = await knex('transactions')
        .where({ id: transactionId })
        .select('id', 'savings_id', 'amount', 'status')
    
    if (!output[0]) throw new Error('Transaction does not exist in the system')

    if (output[0].status !== 'pending') throw new Error('Transaction has been cant be updated')

    const saving = await knex('transactions')
        .where('id', '=', transactionId)
        .update({
            status: status
        })
    
    return output[0]
}

module.exports = { createTable, create, approve, getContributionTransact};