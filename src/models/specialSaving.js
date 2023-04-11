const knex = require("../knexfile");


async function createTable() {
  try {
    await knex.schema.hasTable("specialSavings").then(function (exists) {
      
      if (!exists) {
        async function create() {
          await knex.schema
            .withSchema("thrift_project")
            .createTable("specialSavings", function (table) {
              table.increments("id").primary();
              table.integer('member_id').unsigned()
              table.foreign('member_id').references('id').inTable('members')
              table.float("balance");
              table.float("rate");
              table.enu("frequency", ["monthly", "bi-weekly", "annually", "quaterly",]);
              table.float("restriction_amount", { precision: 6 });
              table.enu("status", ["active", "closed"]);
              table.timestamps("created_at", { precision: 6 });
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