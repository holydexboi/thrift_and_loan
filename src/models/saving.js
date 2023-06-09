const knex = require("../knexfile");
const knexFn = require("knex");
const { v4 } = require("uuid");

async function createTable() {
  try {
    await knex.schema.hasTable("savings").then(function (exists) {
      if (!exists) {
        async function create() {
          await knex.schema
            .withSchema("thrift_project")
            .createTable("savings", function (table) {
              table.string("id").primary();
              table.float("balance");
              table.enu("status", ["active", "closed"]);
              table.string("name");
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

async function getSavingsBalance(savingsId) {
  const output = await knex("savings")
    .where({ id: savingsId })
    .select("balance");

  if (!output[0]) throw new Error("contributions does not exist");

  return output[0].balance;
}

async function add() {

    const output = await knex("savings")
    .where({ id: 1 })
    .select("balance");

    if(output[0]) return

  try {
    const saving = await knex("savings").insert({
      id: 1,
      balance: 0.0,
      status: "active",
      name: "Monthly Conntribution",
    });

    return saving;
  } catch (error) {
    throw new Error(error);
  }
}

async function getContributionType() {
  const output = await knex("savings").select(
    "id",
    "frequency",
    "balance",
    "name",
    "status"
  );
  if (!output[0]) throw new Error("No contribution in the system");

  return output;
}

async function getContribution() {
  const output = await knex("savings")
    .where({ id: 1 })
    .select("id", "balance", "status");

  if (!output[0]) throw new Error("No contribution");

  return output;
}

async function deposit(savingsId, memberId, amount) {
  const output = await knex("savings").where({ id: savingsId }).select("id");

  if (!output[0]) throw new Error("The savings account does not exist");

  const saving = await knex("savings").where("id", "=", savingsId).increment({
    balance: amount,
  });

  const member = await knex("members").where("id", "=", memberId).increment({
    contri_amount: amount,
    available_amount: amount
  })

  return saving;
}

async function withdraw(savingId, memberId, amount) {
  const output = await knex("savings")
    .where({ id: savingId})
    .select("id");

  if (!output[0]) throw new Error("No contribution with the given ID");

  const member_contribution = await knex("members")
    .where({
      id: memberId,
    })
    .select("amount", 'available_amount');

//   if (acctBalance[0].balance < amount) throw new Error("Insufficient balance");

if(member_contribution[0] < amount) throw new Error("Insufficient balance") 

  const saving = await knex("savings").where("id", "=", savingId).decrement({
    balance: amount,
  });

  if(member_contribution[0].amount < amount){
      
      const member = await knex("members").where({id: memberId}).decrement({
          available_amount: amount,
          contri_amount: 0
        })
    }else{
      const member = await knex("members").where({id: memberId}).decrement({
        contri_amount: amount,
        available_amount: amount
      })
  }

  return saving;
}


async function transfer(userId, receiverId, amount) {
  const output = await db("account")
    .where({ user: userId })
    .select("accountId");

  if (!output[0])
    throw new Error("This user does not have an account and cannot transfer");

  const receiver = await db("account")
    .where({ accountId: receiverId })
    .select("accountId");

  if (!receiver[0])
    throw new Error("This user with this account number does not exist");

  const acctBalance = await db("account")
    .where({
      user: userId,
    })
    .select("balance");

  if (acctBalance[0].balance < amount) throw new Error("Insufficient balance");

  try {
    await db.transaction(async (trx) => {
      await trx("account").where("user", "=", userId).decrement({
        balance: amount,
      });

      await trx("account").where("accountId", "=", receiverId).increment({
        balance: amount,
      });
    });
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  createTable,
  add,
  getSavingsBalance,
  getContribution,
  deposit,
  withdraw,
  transfer,
  getContributionType,
};
