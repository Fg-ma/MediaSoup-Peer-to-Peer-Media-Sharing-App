import {
  roomConsumerTransports,
  roomProducerTransports,
  workersMap,
} from "../mediasoupVars";

const onDeleteProducerTransport = async (event: {
  type: string;
  table_id: string;
  username: string;
}) => {
  try {
    if (
      roomProducerTransports[event.table_id] &&
      roomProducerTransports[event.table_id][event.username]
    ) {
      delete roomProducerTransports[event.table_id][event.username];
    }
    if (Object.keys(roomProducerTransports[event.table_id]).length === 0) {
      delete roomProducerTransports[event.table_id];
    }
    if (
      (!roomProducerTransports ||
        (roomProducerTransports[event.table_id] &&
          Object.keys(roomProducerTransports[event.table_id]).length === 0)) &&
      (!roomConsumerTransports ||
        (roomConsumerTransports[event.table_id] &&
          Object.keys(roomConsumerTransports[event.table_id]).length === 0))
    ) {
      delete workersMap[event.table_id];
    }
  } catch (error) {
    console.error(error);
  }
};

export default onDeleteProducerTransport;
