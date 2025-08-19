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
    const token = (event.headers?.Authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return deny("No token");

    const secret = await getSecret();
    const payload = jwt.verify(token, secret);

    return allow(payload.sub, event.methodArn, { email: payload.email });
  } catch (e) {
    console.error(e);
    return deny("Invalid token");
  }
};

function policy(principalId, effect, resource, context = {}) {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [{ Action: "execute-api:Invoke", Effect: effect, Resource: resource }]
    },
    context
  };
}
const allow = (pid, res, ctx) => policy(pid, "Allow", res, ctx);
const deny  = (msg) => policy("unauthorized", "Deny", "*", { reason: msg });
