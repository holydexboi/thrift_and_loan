const knex = require("../knexfile");
const knexFn = require("knex");
const bcrypt = require("bcrypt");
const Saving = require("../models/saving");
const configu = require("config");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");

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
              table.unique("email");
              table.string("password");
              table.boolean("isAdmin");
              table.float("contri_amount");
              table.float("available_amount");
              table.string("lga");
              table.enum("contribution_type", [
                "monthly",
                "weekly",
                "daily",
                "yearly",
              ]);
              table.enu("status", ["approve", "closed", "pending"]);
              table.boolean("has_loan");
              table.date("dob", { precision: 6 });
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

async function add(member) {
  // const output = await knex('members')
  //     .where({ email: member.email })
  //     .select('email')

  // if (output[0]) throw new Error('Member with the given email already exist')
  try {
    const id = await knex("members").insert(member);
  } catch (err) {
    throw new Error(err);
  }
}

async function signin(member) {
  const output = await knex("members")
    .where({ email: member.email })
    .select(
      "id",
      "email",
      "password",
      "firstname",
      "lastname",
      "gender",
      "state",
      "lga",
      "isAdmin",
      "has_loan"
    );

  if (!output[0]) throw new Error("Invalid email/password");

  const result = await bcrypt.compare(member.password, output[0].password);
  if (!result) throw new Error("Invalid email/password");

  const token = jwt.sign(
    { _id: output[0].id, isAdmin: output[0].isAdmin },
    configu.get("jwtPrivateKey")
  );

  return { token, ...output[0] };
}

async function getUser(memberId) {
  const output = await knex("members")
    .where({ id: memberId })
    .select(
      "id",
      "email",
      "firstname",
      "lastname",
      "gender",
      "state",
      "lga",
      "isAdmin",
      "has_loan",
      "contri_amount",
      "available_amount"
    );

  if (!output[0]) throw new Error("Invalid token");

  return output[0];
}

async function getAllUser() {
  const output = await knex("members").select(
    "id",
    "email",
    "firstname",
    "lastname",
    "gender",
    "state",
    "lga",
    "isAdmin",
    "has_loan",
    "contri_amount",
    "status",
    "available_amount"
  );

  if (!output[0]) throw new Error("No User for this contribution");

  return output;
}

async function approve(status, userId) {
  const output = await knex("members").where({ id: userId }).select("id");

  if (!output[0]) throw new Error("No user with the given Id");

  const dividend = await knex("dividends")
    .where("member_id", "=", member_id)
    .select("id");

  if (dividend[0]) {
    const dividendId = v4();
    try {
      await knex.transaction(async (trx) => {
        await trx("members").where("id", "=", userId).update({
          status: status,
        });

        await trx("dividends").insert({
          id: dividendId,
          member_id: userId,
          amount: 0.0,
        });
      });
    } catch (error) {
      console.log(error.message);
    }

    return "Success";
  } else {
    try {
      await knex.transaction(async (trx) => {
        await trx("members").where("id", "=", userId).update({
          status: status,
        });
      });
    } catch (error) {
      console.log(error.message);
    }

    return "Success";
  }
}

async function changeProfile(member, memberId) {
  console.log(member);
  const output = await knex("members")
    .where({ id: memberId })
    .select(
      "id",
      "email",
      "password",
      "firstname",
      "lastname",
      "gender",
      "state",
      "lga",
      "isAdmin",
      "has_loan"
    );

  if (!output[0]) throw new Error("User does not exist");
  const firstname =
    member.firstname === "" ? output.firstname : member.firstname;
  const lastname = member.lastname === "" ? output.lastname : member.lastname;
  const password = member.password === "" ? output.password : member.password;
  const response = await knex("members").where("id", "=", memberId).update({
    firstname: firstname,
    lastname: lastname,
    password: password,
  });

  const userObj = {
    userId: output.id,
    firstname,
    lastname,
    password,
    email: output.email,
    gender: output.gender,
    state: output.state,
    lga: output.lga,
    isAdmin: output.isAdmin,
    has_loan: output.has_loan,
  };

  return userObj;
}

module.exports = {
  createTable,
  add,
  signin,
  changeProfile,
  approve,
  getUser,
  getAllUser,
};
