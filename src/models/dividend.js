const knex = require("../knexfile");


async function createTable() {
  try {
    await knex.schema.hasTable("dividends").then(function (exists) {
      
      if (!exists) {
        async function create() {
          await knex.schema
            .withSchema("thrift_project")
            .createTable("dividends", function (table) {
              table.string("id").primary();
              table.string('member_id')
              table.foreign('member_id').references('id').inTable('members')
              table.float("amount");
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