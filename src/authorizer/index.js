const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const ssm = new AWS.SSM();

const SECRET_PARAM = process.env.JWT_SECRET_PARAM;

async function getSecret() {
  const { Parameter } = await ssm.getParameter({ Name: SECRET_PARAM, WithDecryption: true }).promise();
  return Parameter.Value;
}

exports.handler = async (event, _context, callback) => {
  try {
    const token = (event.authorizationToken || "").replace(/^Bearer\s+/i, "");
    if (!token) return callback("Unauthorized");

    const secret = await getSecret();
    const decoded = jwt.verify(token, secret);

    const effect = "Allow";
    const policy = {
      principalId: decoded.sub || decoded.email || "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          { Action: "execute-api:Invoke", Effect: effect, Resource: event.methodArn }
        ]
      },
      context: {
        userId: decoded.sub || "",
        email: decoded.email || ""
      }
    };
    return callback(null, policy);
  } catch (e) {
    console.error(e);
    return callback("Unauthorized");
  }
};
