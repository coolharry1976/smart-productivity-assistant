const AWS = require("aws-sdk");
const { v4: uuid } = require("uuid");
const dynamo = new AWS.DynamoDB.DocumentClient();

const TASKS_TABLE = process.env.TABLE_TASKS;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

exports.listCreate = async (event) => {
  try {
    const auth = event.requestContext.authorizer || {};
    const userId = auth.userId;
    if (!userId) return { statusCode: 401, headers: CORS, body: JSON.stringify({ message: "unauthorized" }) };

    if (event.httpMethod === "GET") {
      const res = await dynamo.query({
        TableName: TASKS_TABLE,
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: { ":u": userId },
      }).promise();
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ items: res.Items || [] }) };
    }

    if (event.httpMethod === "POST") {
      const { title, dueDate } = JSON.parse(event.body || "{}");
      if (!title) return { statusCode: 400, headers: CORS, body: JSON.stringify({ message: "title required" }) };

      const now = new Date().toISOString();
      const item = {
        userId,
        taskId: uuid(),
        title,
        status: "open",
        dueDate: dueDate || null,
        createdAt: now,
        updatedAt: now,
      };
      await dynamo.put({ TableName: TASKS_TABLE, Item: item }).promise();
      return { statusCode: 201, headers: CORS, body: JSON.stringify(item) };
    }

    return { statusCode: 405, headers: CORS, body: JSON.stringify({ message: "method not allowed" }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ message: "internal error" }) };
  }
};

exports.updateDelete = async (event) => {
  try {
    const auth = event.requestContext.authorizer || {};
    const userId = auth.userId;
    if (!userId) return { statusCode: 401, headers: CORS, body: JSON.stringify({ message: "unauthorized" }) };

    const taskId = event.pathParameters && event.pathParameters.taskId;

    if (event.httpMethod === "PUT") {
      const { status } = JSON.parse(event.body || "{}");
      const updatedAt = new Date().toISOString();
      await dynamo.update({
        TableName: TASKS_TABLE,
        Key: { userId, taskId },
        UpdateExpression: "SET #s = :s, updatedAt = :u",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":s": status, ":u": updatedAt },
      }).promise();
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ item: { taskId, status, updatedAt } }) };
    }

    if (event.httpMethod === "DELETE") {
      await dynamo.delete({ TableName: TASKS_TABLE, Key: { userId, taskId } }).promise();
      return { statusCode: 204, headers: CORS, body: "" };
    }

    return { statusCode: 405, headers: CORS, body: JSON.stringify({ message: "method not allowed" }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ message: "internal error" }) };
  }
};
