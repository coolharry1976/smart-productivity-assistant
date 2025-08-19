const { doc, USERS_TABLE, QueryCommand, PutCommand } = require("../lib/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return resp(400, { message: "email and password required" });
    }

    // Check if email exists already
    const dup = await doc.send(new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: "email-index",
      KeyConditionExpression: "#e = :email",
      ExpressionAttributeNames: { "#e": "email" },
      ExpressionAttributeValues: { ":email": email },
      Limit: 1
    }));
    if (dup.Items && dup.Items.length > 0) {
      return resp(409, { message: "email already registered" });
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    await doc.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: { userId, email, passwordHash, createdAt: now }
    }));

    return resp(201, { userId, email, createdAt: now });
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
