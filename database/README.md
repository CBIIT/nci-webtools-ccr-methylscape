# Getting Started

1. Create config.json. For example:

```js
{
  "database": {
    "host": "example-host",
    "port": 5432,
    "user": "methylscape-user",
    "password": "methylscape-password",
    "database": "methylscape-database"
  },
  "aws": {
    "region": "us-east-1",
    "s3DataBucket": "example-s3-bucket",
    "s3DataKey": "data/",
    "sqsName": "example-queue-name.fifo"
  },
  "email": {
    "from": "sender@example.com",
    "smtp": {
      "host": "example-smtp-host",
      "port": 587,
      "auth": {
        "user": "smtp-username",
        "pass": "smtp-password"
      }
    }
  }
}
```

2. Review the sources/userSources.js to determine the expected columns/filenames for source data.
3. Acquire or generate source data.
4. Execute the following to import data:

```sh
npm install
node createDatabase.js
node importDatabase.js --provider local --sources userSources.js data/ # import user information
node importDatabase.js --provider local --sources sources.js data/ # import sample information
```

Useful entrypoints:

- startDatabaseImport.js - Imports sample data, ensuring that logs are saved to the importLog table
- startQueueWorker.js - Listens for SQS messages from the specified queue, initiating import whenever an import request is received
