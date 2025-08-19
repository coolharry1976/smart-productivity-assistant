const { doc, TASKS_TABLE, UpdateCommand } = require("../lib/db");
const { getUser, json } = require("./_auth");

exports.handler = async (event) => {
  try {
    const { userId } = await getUser(event);
    const taskId = event.pathParameters?.taskId;
    if (!taskId) return json(400, { message: "taskId required" });

    const body = JSON.parse(event.body || "{}");
    const fields = {};
    if (typeof body.title === "string") fields.title = body.title.trim();
    if (typeof body.status === "string") fields.status = body.status.trim();
    if (body.dueDate !== undefined) fields.dueDate = body.dueDate;

    if (Object.keys(fields).length === 0) {
      return json(400, { message: "no fields to update" });
    }

    const setParts = [];
    const names = {};
    const values = {};
    let i = 0;
    for (const [k, v] of Object.entries(fields)) {
      const nk = `#k${i}`, nv = `:v${i}`;
      setParts.push(`${nk} = ${nv}`);
      names[nk] = k;
      values[nv] = v;
      i++;
    }
    // always update updatedAt
    setParts.push("#kU = :vU");
    names["#kU"] = "updatedAt";
    values[":vU"] = new Date().toISOString();

    const out = await doc.send(new UpdateCommand({
      TableName: TASKS_TABLE,
      Key: { userId, taskId },
      UpdateExpression: "SET " + setParts.join(", "),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: "attribute_exists(userId) AND attribute_exists(taskId)",
      ReturnValues: "ALL_NEW",
    }));

    return json(200, { item: out.Attributes });
  } catch (e) {
    console.error(e);
    const code = /ConditionalCheckFailed/.test(String(e)) ? 404 : 401;
    return json(code, { message: e.message || "Unauthorized" });
  }
};
