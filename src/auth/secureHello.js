const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

exports.handler = async (event) => {
  try {
    const ctx = event.requestContext && event.requestContext.authorizer;
    const userId = ctx && ctx.userId;
    const email = ctx && ctx.email;
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, userId, email }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ message: "internal error" }) };
  }
};
