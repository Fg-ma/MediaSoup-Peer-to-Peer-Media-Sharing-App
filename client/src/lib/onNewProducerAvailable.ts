import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const onNewProducerAvailable = (
  event: {
    type: string;
    producerUsername: string;
    producerType: string;
    producerId?: string;
  },
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  isSubscribed: React.MutableRefObject<boolean>
) => {
  if (
    event.producerUsername !== username.current &&
    isSubscribed.current &&
    device.current
  ) {
    const { rtpCapabilities } = device.current;

    const msg = {
      type: "newConsumer",
      consumerType: event.producerType,
      rtpCapabilities: rtpCapabilities,
      producerUsername: event.producerUsername,
      table_id: table_id.current,
      username: username.current,
      incomingProducerId: event.producerId,
    };
    socket.current.send(msg);
  }
};

export default onNewProducerAvailable;
