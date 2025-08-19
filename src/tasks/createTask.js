const { v4: uuidv4 } = require("uuid");
const { doc, TASKS_TABLE, PutCommand } = require("../lib/db");
const { getUser, json } = require("./_auth");

exports.handler = async (event) => {
  try {
    const { userId } = await getUser(event);
    const body = JSON.parse(event.body || "{}");
    const title = (body.title || "").trim();
    const dueDate = body.dueDate || null; // ISO string or null
    const status = (body.status || "open").trim(); // open | done
    if (!title) return json(400, { message: "title required" });

    const taskId = uuidv4();
    const now = new Date().toISOString();

    await doc.send(new PutCommand({
      TableName: TASKS_TABLE,
      Item: { userId, taskId, title, status, dueDate, createdAt: now, updatedAt: now },
      ConditionExpression: "attribute_not_exists(userId) AND attribute_not_exists(taskId)",
    }));

    return json(201, { taskId, title, status, dueDate, createdAt: now, updatedAt: now });
  } catch (e) {
    console.error(e);
    return json(401, { message: e.message || "Unauthorized" });
  }
};
