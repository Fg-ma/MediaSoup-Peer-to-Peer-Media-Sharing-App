import { roomProducerTransports } from "../mediasoupVars";

const onDeleteProducerTransport = async (event: {
  type: string;
  roomName: string;
  username: string;
}) => {
  try {
    if (
      roomProducerTransports[event.roomName] &&
      roomProducerTransports[event.roomName][event.username]
    ) {
      delete roomProducerTransports[event.roomName][event.username];
    }
  } catch (error) {
    console.error(error);
  }
};

export default onDeleteProducerTransport;
