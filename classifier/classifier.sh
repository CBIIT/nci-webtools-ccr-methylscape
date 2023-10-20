#!/bin/sh
set -ex

JOB_ID=$1

DATA_DIR=$PWD/data
RESULTS_DIR=$PWD/data/output/$JOB_ID
IMAGE_NAME=methylscape-classifier
IMAGE_PATH=docker/classifier.dockerfile

mkdir -p $DATA_DIR
mkdir -p $RESULTS_DIR

docker build -t $IMAGE_NAME -f docker/classifier.dockerfile $PWD
echo "Executing job $JOB_ID"
docker run --rm -v $DATA_DIR:/data -v $RESULTS_DIR:/output $IMAGE_NAME npm start $JOB_ID