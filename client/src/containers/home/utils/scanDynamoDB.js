// const AWS = require('aws-sdk');
import AWS from 'aws-sdk';

export let scanTable = async tableName => {
  AWS.config.update({ region: 'us-east-1' });
  console.log('TEST');
  var documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
  });
  const params = {
    TableName: tableName
  };
  let scanResults = [];
  let items;
  do {
    items = await documentClient.scan(params).promise();
    items.Items.forEach(item => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey != 'undefined');

  return scanResults;
};