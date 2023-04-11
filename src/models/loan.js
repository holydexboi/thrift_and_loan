const knex = require("../knexfile");


async function createTable() {
  try {
    await knex.schema.hasTable("loans").then(function (exists) {
      
      if (!exists) {
        async function create() {
          await knex.schema
            .withSchema("thrift_project")
            .createTable("loans", function (table) {
              table.increments("id").primary();
              table.string('member_id')
              table.foreign('member_id').references('id').inTable('members')
              table.float("amount");
              table.float("rate");
              table.float("term");
              table.enu("frequency", ["monthly", "bi-weekly", "yearly"]);
              table.datetime("start_date", { precision: 6 });
              table.datetime("end_date", { precision: 6 });
              table.float("repayment_amount", { precision: 6 });
              table.enu("status", ["active", "paid_off"]);
              table.float("late_fees");
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

module.exports = { createTable };