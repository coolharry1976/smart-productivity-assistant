// spa-serverless/src/register.js
const AWS = require("aws-sdk");
const { v4: uuid } = require("uuid");
const dynamo = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = process.env.TABLE_USERS;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "X-Debug-Register": "v5" // visible marker
};

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { email, password } = body;
    if (!email || !password) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ message: "email and password required" }) };
    }

    const existing = await dynamo.get({ TableName: USERS_TABLE, Key: { email } }).promise();
    if (existing.Item) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ message: "email already registered" }) };
    }

    const userId = uuid();
    await dynamo.put({
      TableName: USERS_TABLE,
      Item: { email, userId, password }, // demo only; hash in prod
      ConditionExpression: "attribute_not_exists(email)"
    }).promise();

    return { statusCode: 201, headers: CORS, body: JSON.stringify({ ok: true, email, userId }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ message: "internal error" }) };
  }
};
