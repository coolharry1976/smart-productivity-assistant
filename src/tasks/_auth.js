const jwt = require("jsonwebtoken");
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

const ssm = new SSMClient({});
let cached;

async function secret() {
  if (cached) return cached;
  const out = await ssm.send(new GetParameterCommand({
    Name: "/spa/JWT_SECRET",
    WithDecryption: true,
  }));
  cached = out.Parameter.Value;
  return cached;
}

exports.getUser = async (event) => {
  // prefer authorizer if present
  const pid = event.requestContext?.authorizer?.principalId || null;
  const email = event.requestContext?.authorizer?.email || null;
  if (pid && email) return { userId: pid, email };

  // fallback: verify token here
  const auth = event.headers?.Authorization || event.headers?.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Missing Bearer token");
  const s = await secret();
  const decoded = jwt.verify(token, s);
  return { userId: decoded.sub, email: decoded.email };
};

exports.json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
