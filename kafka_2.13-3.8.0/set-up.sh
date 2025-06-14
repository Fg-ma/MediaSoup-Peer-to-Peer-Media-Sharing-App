#!/bin/bash

if [ ! -e table-top-secrets ]; then
  sudo -u kafka ln -s /home/fg/Desktop/mediaSoupPeertoPeerMediaSharingApp/tableTopSecrets/table-top-secrets.properties table-top-secrets
fi

KAFKA_DIR="$HOME/Desktop/mediaSoupPeertoPeerMediaSharingApp/kafka_2.13-3.8.0"
LOG_DIR=$(grep '^log.dirs=' "$KAFKA_DIR/config/server.properties" | cut -d= -f2)

if [ -f "$LOG_DIR/meta.properties" ]; then
  echo "Kafka is already initialized. Skipping format."
  exit 0
fi

echo "Generating new Kafka cluster ID..."
KAFKA_CLUSTER_ID="$("$KAFKA_DIR/bin/kafka-storage.sh" random-uuid)"
echo "Cluster ID: $KAFKA_CLUSTER_ID"

echo "Formatting Kafka log directory..."
sudo -u kafka "$KAFKA_DIR/bin/kafka-storage.sh" format \
  -t "$KAFKA_CLUSTER_ID" \
  -c "$KAFKA_DIR/config/server.properties"

echo "Kafka storage initialized successfully."

