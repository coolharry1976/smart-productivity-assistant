exports.handler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId || "unknown";
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, userId })
  };
};
