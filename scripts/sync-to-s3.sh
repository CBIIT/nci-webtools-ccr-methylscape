#!/bin/bash
set -ex

# Load AWS module (execute only on Helix)
module load aws

# Ensure SOURCE and DESTINATION do NOT have trailing slashes
AWS_PROFILE=example-profile-name
SOURCE=/example/path/to/source
DESTINATION=s3://example-bucket/example/path/to/destination

aws s3 cp $SOURCE/anno_heme.txt $DESTINATION/anno_heme.txt --profile $AWS_PROFILE
aws s3 cp $SOURCE/anno_kidney.txt $DESTINATION/anno_kidney.txt --profile $AWS_PROFILE
aws s3 cp $SOURCE/anno_neuro.txt $DESTINATION/anno_neuro.txt --profile $AWS_PROFILE
aws s3 cp $SOURCE/anno_pan.txt $DESTINATION/anno_pan.txt --profile $AWS_PROFILE
aws s3 cp $SOURCE/anno_sarcoma.txt $DESTINATION/anno_sarcoma.txt --profile $AWS_PROFILE
aws s3 cp $SOURCE/Sample_sheet_master.csv $DESTINATION/Sample_sheet_master.csv --profile $AWS_PROFILE
aws s3 sync $SOURCE/CNV/bins/ $DESTINATION/CNV/bins/ --exact-timestamps --delete --profile $AWS_PROFILE 
aws s3 sync $SOURCE/CNV/segments/ $DESTINATION/CNV/segments/ --exact-timestamps --delete --profile $AWS_PROFILE
