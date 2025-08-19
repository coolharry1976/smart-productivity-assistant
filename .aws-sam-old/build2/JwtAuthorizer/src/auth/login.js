const { doc, USERS_TABLE, QueryCommand } = require("../lib/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

const ssm = new SSMClient({});
let cachedSecret;

async function getSecret() {
  if (cachedSecret) return cachedSecret;
  const out = await ssm.send(new GetParameterCommand({
    Name: process.env.JWT_SECRET_PARAM,
    WithDecryption: true
  }));
  cachedSecret = out.Parameter.Value;
  return cachedSecret;
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return resp(400, { message: "email and password required" });
    }

    // Look up user
    const res = await doc.send(new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: "email-index",
      KeyConditionExpression: "#e = :email",
      ExpressionAttributeNames: { "#e": "email" },
      ExpressionAttributeValues: { ":email": email },
      Limit: 1
    }));

    const user = res.Items && res.Items[0];
    if (!user) return resp(401, { message: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return resp(401, { message: "invalid credentials" });

    const secret = await getSecret();
    const token = jwt.sign({ sub: user.userId, email: user.email }, secret, { expiresIn: "7d" });

    return resp(200, { token });
  } catch (err) {
    console.error(err);
    return resp(500, { message: "internal error" });
  }
};

function resp(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}
