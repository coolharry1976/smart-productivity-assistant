const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE;

module.exports = {
  doc,
  USERS_TABLE,
  GetCommand, QueryCommand, PutCommand
};
