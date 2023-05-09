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

async function getAllDividend() {
  
  const output = await knex('dividends')
    .innerJoin(
      'members', 
      'dividends.member_id', 
      '=', 
      'members.id'
    )
    .select('dividends.id','members.firstname', 'members.lastname',  'dividends.amount')
  
  if (!output[0]) throw new Error('No Dividend in the database')

  return output
}

module.exports = { createTable, getAllDividend };