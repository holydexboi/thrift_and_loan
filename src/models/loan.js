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
              table.string("member_id");
              table.foreign("member_id").references("id").inTable("members");
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
              table
                .timestamp("created_at", { precision: 6 })
                .defaultTo(knex.fn.now(6));
            });
        }
        create();
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function applyLoan(loan) {
  console.log(loan);
  const memberCheck = await knex("members")
    .where({ id: loan.member_id, status: "pending" })
    .select("id");

  if (memberCheck[0])
    throw new Error("You account has not been approved by the admin");

  const output = await knex("loans")
    .where({ member_id: loan.member_id, status: "active" })
    .select("member_id");

  if (output[0])
    throw new Error("You have a pending loan and cannot apply for new loan");

  const id = await knex("loans").insert(loan);

  const user = await knex("members").where("id", "=", loan.member_id).update({
    has_loan: true,
  });

  console.log(user);

  return id;
}

async function approveLoan(loanId, status) {
  const output = await knex("loans")
    .where({ id: loanId })
    .select("id", "status");

  if (!output[0]) throw new Error("No loan with the given Id");

  const loan = await knex("loans").where("id", "=", loanId).update({
    status: status,
  });

  return loan;
}

async function getAllLoan() {
  const output = await knex("loans")
    .innerJoin(
      'members', 
      'loans.member_id', 
      '=', 
      'members.id'
    )
    .select(
      "loans.id",
      "loans.amount",
      "loans.loan_balance",
      "loans.interest",
      "loans.start_date",
      "loans.end_date",
      "loans.repayment_amount",
      "loans.repayment_balance",
      "loans.collateral",
      "loans.status",
      "members.firstname",
      "members.lastname"
    );

  if (!output[0]) throw new Error("You have not apply for a loan");

  return output;
}

async function getMyLoan(member_id) {
  const output = await knex("loans")
  .where({ member_id: member_id })
    .select(
      "id",
      "amount",
      "loan_balance",
      "interest",
      "start_date",
      "end_date",
      "repayment_amount",
      "repayment_balance",
      "collateral",
      "status"
    );

  if (!output[0]) throw new Error("You have not apply for a loan");

  return output;
}

async function repayLoan(loanId, amount) {
  const output = await knex("loans")
    .where({ id: loanId })
    .select(
      "id",
      "amount",
      "loan_balance",
      "interest",
      "start_date",
      "end_date",
      "repayment_amount",
      "repayment_balance",
      "collateral",
      "status"
    );

  if (!output[0]) throw new Error("No loan with the given Id");

  if (output[0].repayment_balance + amount >= output[0].repayment_amount) {
    const loan = await knex("loans")
      .where("id", "=", loanId)
      .update({
        status: "paid_off",
      })
      .increment({
        repayment_balance: amount,
      });

      const profit = output[0].repayment_balance + amount - output[0].amount

      const members = await knex('members')
      .where({status: 'approve', isAdmin: 0})
      .select('id', 'contri_amount')

      const saving = await knex('savings')
      .where({id: 1})
      .select('id', 'balance')

      const savingsBalance = saving[0].balance

      members.map(async (member) => {

        const contri_amount = member.contri_amount
        
        const memberPercent = (contri_amount/savingsBalance) * 100

        console.log(memberPercent)

        const memberDiv = (memberPercent/100) * profit

        const loan = await knex("dividends")
      .where("member_id", "=", member.id)
      .increment({
        amount: memberDiv,
      })

      })

  } else {
    const loan = await knex("loans").where("id", "=", loanId).increment({
      repayment_balance: amount,
    });
  }

  return output;
}

module.exports = { createTable, applyLoan, getMyLoan, approveLoan, repayLoan, getAllLoan};
