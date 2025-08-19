const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const dynamo = new AWS.DynamoDB.DocumentClient();
const ssm = new AWS.SSM();

const USERS_TABLE = process.env.TABLE_USERS;
const SECRET_PARAM = process.env.JWT_SECRET_PARAM;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

async function getSecret() {
  const { Parameter } = await ssm.getParameter({ Name: SECRET_PARAM, WithDecryption: true }).promise();
  return Parameter.Value;
}

exports.handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || "{}");
    if (!email || !password) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ message: "email and password required" }) };
    }

    const user = await dynamo.get({ TableName: USERS_TABLE, Key: { email } }).promise();
    if (!user.Item || user.Item.password !== password) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ message: "invalid credentials" }) };
    }

    const secret = await getSecret();
    const token = jwt.sign({ sub: user.Item.userId, email: user.Item.email }, secret, { expiresIn: "7d" });

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ token }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ message: "internal error" }) };
  }
};
