const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'db4free.net',
      port : 3306,
      user : 'dhulqev147',
      password : 'Dhulqev147',
      database : 'thrift_project'
    },
    debug: true
  });

  module.exports = knex