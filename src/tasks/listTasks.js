const { doc, TASKS_TABLE, QueryCommand } = require("../lib/db");
const { getUser, json } = require("./_auth");

exports.handler = async (event) => {
  try {
    const { userId } = await getUser(event);

    const out = await doc.send(new QueryCommand({
      TableName: TASKS_TABLE,
      KeyConditionExpression: "#u = :u",
      ExpressionAttributeNames: { "#u": "userId" },
      ExpressionAttributeValues: { ":u": userId },
      ScanIndexForward: true,
    }));

    return json(200, { items: out.Items || [] });
  } catch (e) {
    console.error(e);
    return json(401, { message: e.message || "Unauthorized" });
  }
};
