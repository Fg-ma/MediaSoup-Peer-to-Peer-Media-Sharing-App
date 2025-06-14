#!/bin/bash

if [ ! -e table-top-secrets ]; then
  sudo -u kafka ln -s /home/fg/Desktop/mediaSoupPeertoPeerMediaSharingApp/tableTopSecrets/table-top-secrets.properties table-top-secrets
fi

KAFKA_DIR="$HOME/Desktop/mediaSoupPeertoPeerMediaSharingApp/kafka_2.13-3.8.0"

SECRETS_ENV="$HOME/Desktop/mediaSoupPeertoPeerMediaSharingApp/tableTopSecrets/env/.tabletopenv"

if [[ -f "$SECRETS_ENV" ]]; then
  source "$SECRETS_ENV"
fi

export CA_LOCATION
export KAFKA_CONNECT_TRUSTSTORE_LOCATION KAFKA_CONNECT_TRUSTSTORE_PASSWORD KAFKA_CONNECT_TRUSTSTORE_TYPE
export KAFKA_CONNECT_KEYSTORE_LOCATION KAFKA_CONNECT_KEYSTORE_PASSWORD KAFKA_CONNECT_KEYSTORE_TYPE

# Start Kafka server
sudo -u kafka "$KAFKA_DIR/bin/kafka-server-start.sh" "$KAFKA_DIR/config/server.properties" &
KAFKA_PID=$!

while ! nc -z localhost 9092; do
  echo "Waiting for Kafka to start on port 9092..."
  sleep 2
done

# Start Kafka Connect
sudo -u kafka env KAFKA_OPTS="\
  -Djavax.net.ssl.trustStore=${KAFKA_CONNECT_TRUSTSTORE_LOCATION} \
  -Djavax.net.ssl.trustStorePassword=${KAFKA_CONNECT_TRUSTSTORE_PASSWORD} \
  -Djavax.net.ssl.trustStoreType=${KAFKA_CONNECT_TRUSTSTORE_TYPE} \
  -Djavax.net.ssl.keyStore=${KAFKA_CONNECT_KEYSTORE_LOCATION} \
  -Djavax.net.ssl.keyStorePassword=${KAFKA_CONNECT_KEYSTORE_PASSWORD} \
  -Djavax.net.ssl.keyStoreType=${KAFKA_CONNECT_KEYSTORE_TYPE}" \
  "$KAFKA_DIR/bin/connect-standalone.sh" \
  "$KAFKA_DIR/config/connect-standalone.properties" \
  "$KAFKA_DIR/config/mongo-source.properties" \
  "$KAFKA_DIR/config/es-sink.properties" \
  "$KAFKA_DIR/config/qdrant-sink.properties" &
CONNECT_PID=$!

# Shutdown function
shutdown() {
  echo "Shutting down Kafka Connect and Kafka Server..."
  kill $CONNECT_PID
  wait $CONNECT_PID
  kill $KAFKA_PID
  wait $KAFKA_PID
  echo "Shutdown complete."
  exit 0
}

# Trap SIGINT and SIGTERM
trap shutdown SIGINT SIGTERM

# Wait for background processes
wait $KAFKA_PID
wait $CONNECT_PID

