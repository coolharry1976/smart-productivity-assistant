const { doc, TASKS_TABLE, DeleteCommand } = require("../lib/db");
const { getUser, json } = require("./_auth");

exports.handler = async (event) => {
  try {
    const { userId } = await getUser(event);
    const taskId = event.pathParameters?.taskId;
    if (!taskId) return json(400, { message: "taskId required" });

    await doc.send(new DeleteCommand({
      TableName: TASKS_TABLE,
      Key: { userId, taskId },
      ConditionExpression: "attribute_exists(userId) AND attribute_exists(taskId)",
    }));

    return json(204, {});
  } catch (e) {
    console.error(e);
    const code = /ConditionalCheckFailed/.test(String(e)) ? 404 : 401;
    return json(code, { message: e.message || "Unauthorized" });
  }
};
