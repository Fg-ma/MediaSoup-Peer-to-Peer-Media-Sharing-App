import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const onSwapedProducer = async (
  event: {
    type: string;
    producerUsername: string;
    producerType: string;
    producerId: string;
  },
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  isSubscribed: React.MutableRefObject<boolean>
) => {
  if (
    event.producerUsername === username.current ||
    !isSubscribed.current ||
    !device.current
  ) {
    return;
  }

  const { rtpCapabilities } = device.current;

  const msg = {
    type: "swapConsumer",
    consumerType: event.producerType,
    swappingProducerId: event.producerId,
    swappingUsername: event.producerUsername,
    table_id: table_id.current,
    username: username.current,
    rtpCapabilities: rtpCapabilities,
  };
  socket.current.emit("message", msg);
};

export default onSwapedProducer;
