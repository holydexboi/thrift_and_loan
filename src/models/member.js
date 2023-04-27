const knex = require("../knexfile");
const knexFn = require('knex');
const bcrypt = require('bcrypt')
const Saving = require('../models/saving')
const configu = require('config')
const jwt = require('jsonwebtoken');
const { v4 } = require('uuid')


async function createTable() {
  try {
    await knex.schema.hasTable("members").then(function (exists) {
   
      if (!exists) {
        async function create() {
          await knex.schema
            .withSchema("thrift_project")
            .createTable("members", function (table) {
              table.string("id").primary();
              table.string("firstname");
              table.string("lastname");
              table.enu("gender", ["male", "female"]);
              table.string("state");
              table.string("email");
              table.string("password");
              table.string("lga");
              table.date("dob", { precision: 6 });
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

async function add(member, savingsType) {
    const output = await knex('members')
        .where({ email: member.email })
        .select('email')
    
    if (output[0]) throw new Error('Member with the given email already exist')

    const id = await knex('members').insert(member);
    
    
    const savingsId = v4();

    await Saving.add({id : savingsId, member_id: member.id, balance: 0, status: "pending", frequency: savingsType})
        .then(saving => {
        console.log(saving)
        })
        .catch(error => {
        console.log(error.message)
        })
}

async function signin(member) {
    
    const output = await knex('members')
        .where({ email: member.email })
        .select('id','email','password', 'firstname', 'lastname', 'gender', 'state', 'lga')
    
    if (!output[0]) throw new Error('Invalid email/password')
    
    const result = await bcrypt.compare(member.password, output[0].password)
    if (!result) throw new Error('Invalid email/password')
    
    const token = jwt.sign({ _id: output[0].id }, configu.get('jwtPrivateKey'));
    
    return {token, output: output[0]}
}

async function changeProfile(member, memberId) {
    console.log(member)
  const output = await knex('members')
      .where({ id: memberId })
      .select('id','email','password', 'firstname', 'lastname')
  
  if (!output[0]) throw new Error('User does not exist')
  const firstname = member.firstname === '' ? output.firstname : member.firstname 
  const lastname = member.lastname === '' ? output.lastname : member.lastname
  const password = member.password === '' ? output.password : member.password
  const response = await knex('members')
        .where('id', '=', memberId)
        .update({
            firstname: firstname,
            lastname: lastname,
            password: password
        })
  
  return response
}

module.exports = { createTable, add, signin, changeProfile };
