#!/bin/bash
set -ex

# Load AWS module (execute only on Helix)
# Comment this line out to test locally
module load aws

AWS_PROFILE=example-profile-name
SOURCE_BUCKET=example-bucket
SOURCE_PREFIX=path/to/source/
DESTINATION=example/path/to/destination
DATE=$(date -d "14 days ago" "+%Y-%m-%dT%H:%M:%SZ")

# list files from $DATE until now
aws s3api list-objects --bucket $SOURCE_BUCKET --prefix $SOURCE_PREFIX --query "Contents[?LastModified>='$DATE'].[Key]" --output text --profile $AWS_PROFILE > include-files.txt

# copy files from source s3 folder to destination local folder
while read line; do
  aws s3 sync s3://$SOURCE_BUCKET/$SOURCE_PREFIX $DESTINATION --exclude "*" --include "${line//$SOURCE_PREFIX}" --profile $AWS_PROFILE
done < include-files.txt