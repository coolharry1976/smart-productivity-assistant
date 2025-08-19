const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;
const TASKS_TABLE = process.env.TASKS_TABLE;

module.exports = {
  doc,
  USERS_TABLE,
  TASKS_TABLE,
  GetCommand,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
};
