const knex = require("../knexfile");


async function createTable() {
  try {
    await knex.schema.hasTable("loans").then(function (exists) {
      
      if (!exists) {
        async function create() {
          await knex.schema
            .withSchema("thrift_project")
            .createTable("loans", function (table) {
              table.string("id").primary();
              table.string('member_id')
              table.foreign('member_id').references('id').inTable('members')
              table.float("amount");
              table.float("loan_balance");
              table.float("interest");
              table.float("rate");
              table.float("term");
              table.datetime("start_date", { precision: 6 });
              table.datetime("end_date", { precision: 6 });
              table.float("repayment_amount", { precision: 6 });
              table.float("repayment_balance", { precision: 6 });
              table.enu("status", ["active", "paid_off", "pending"]);
              table.string("collateral");
              table.timestamp("created_at", { precision: 6 }).defaultTo(knex.fn.now(6));
            });
        }
        create()
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function applyLoan(loan) {
  console.log(loan)
  const memberCheck = await knex('members')
      .where({ id: loan.member_id, has_loan: true})
      .select('member_id')
  
  if (memberCheck[0]) throw new Error('You account has not been approved by the admin')

  const output = await knex('loans')
      .where({ member_id: loan.member_id, status: "active"})
      .select('member_id')
  
  if (output[0]) throw new Error('You have a pending loan and cannot apply for new loan')

  const id = await knex('loans').insert(loan);

  return id
}

async function getMyLoan(member_id) {
  
  const output = await knex('loans')
      .where({ member_id: member_id})
      .select('id', 'amount', 'loan_balance', 'interest', 'start_date', 'end_date', 'repayment_amount', 'collateral', 'status')
  
  if (!output[0]) throw new Error('You have not apply for a loan')

  return output
}

module.exports = { createTable, applyLoan, getMyLoan };